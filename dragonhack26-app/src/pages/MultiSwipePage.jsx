import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import SwipeCard from '../components/SwipeCard'
import FoodDetail from '../components/FoodDetail'
import { socket } from '../lib/socket'
import useAppStore from '../store/useAppStore'

export default function MultiSwipePage() {
  const navigate = useNavigate()
  const { multiplayerFoods, roomCode, setLikedFood, clearRoom } = useAppStore()

  const [stack, setStack] = useState(() => [...multiplayerFoods].reverse())
  const [showDetail, setShowDetail] = useState(false)
  const [matchBanner, setMatchBanner] = useState(null) // food that was matched

  const topFood = stack[stack.length - 1]
  const visibleStack = stack.slice(-3)

  useEffect(() => {
    if (!roomCode) { navigate('/multiplayer'); return }

    function onKey(e) {
      if (!topFood || showDetail) return
      if (e.key === 'ArrowRight' || e.key === 'l') handleLike(topFood)
      if (e.key === 'ArrowLeft'  || e.key === 'h') handleSkip()
      if (e.key === 'ArrowUp'    || e.key === 'k') setShowDetail(true)
      if (e.key === 'Escape') setShowDetail(false)
    }
    window.addEventListener('keydown', onKey)

    socket.on('match-found', ({ foodId }) => {
      const food = multiplayerFoods.find(f => f.id === foodId)
      if (!food) return
      setMatchBanner(food)
    })

    return () => {
      window.removeEventListener('keydown', onKey)
      socket.off('match-found')
    }
  }, [topFood, showDetail, roomCode])

  function handleLike(food) {
    socket.emit('swipe-right', { roomCode, foodId: food.id })
    setStack(s => s.slice(0, -1))
  }

  function handleSkip() {
    setStack(s => s.slice(0, -1))
  }

  // ── Match screen ───────────────────────────────────────────
  if (matchBanner) {
    function handleContinue() {
      setLikedFood(matchBanner)
      socket.disconnect()
      clearRoom()
      navigate('/result')
    }

    return (
      <motion.div
        className="result-page"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="result-card">
          <div className="result-match-badge">🎉 It's a Match!</div>

          <img src={matchBanner.image} alt={matchBanner.name} className="result-img" />

          <div className="result-info">
            <div className="swipe-card__tags" style={{ justifyContent: 'center', marginBottom: 8 }}>
              <span className="swipe-tag">{matchBanner.category}</span>
              {matchBanner.area && <span className="swipe-tag swipe-tag--muted">{matchBanner.area}</span>}
            </div>
            <h1 className="result-name">{matchBanner.name}</h1>
            {matchBanner.ingredients.length > 0 && (
              <p className="result-ingredients">
                {matchBanner.ingredients.slice(0, 5).map(i => i.name).join(', ')}
                {matchBanner.ingredients.length > 5 ? ` +${matchBanner.ingredients.length - 5} more` : ''}
              </p>
            )}
          </div>

          <div className="result-links">
            {matchBanner.recipeUrl && (
              <a href={matchBanner.recipeUrl} target="_blank" rel="noopener noreferrer" className="result-link-btn result-link-btn--primary">
                📖 View Full Recipe
              </a>
            )}
            {matchBanner.youtubeUrl && (
              <a href={matchBanner.youtubeUrl} target="_blank" rel="noopener noreferrer" className="result-link-btn result-link-btn--yt">
                ▶ Watch on YouTube
              </a>
            )}
            {!matchBanner.recipeUrl && !matchBanner.youtubeUrl && (
              <p style={{ color: 'var(--text)', fontSize: '0.9rem' }}>No recipe link available.</p>
            )}
          </div>

          <button className="setup-cta" onClick={handleContinue}>
            Done →
          </button>
        </div>
      </motion.div>
    )
  }

  // ── No more cards ──────────────────────────────────────────
  if (!topFood) {
    return (
      <div className="swipe-page swipe-page--center">
        <div style={{ fontSize: 56 }}>😅</div>
        <h2 style={{ color: 'var(--text-h)', margin: '12px 0 8px' }}>No more food!</h2>
        <p style={{ color: 'var(--text)', marginBottom: 24 }}>No match found this round.</p>
        <button className="setup-cta" style={{ maxWidth: 200 }} onClick={() => {
          socket.disconnect(); clearRoom(); navigate('/mode')
        }}>
          Start over
        </button>
      </div>
    )
  }

  // ── Main swipe view ────────────────────────────────────────
  return (
    <div className="swipe-page">
      <header className="swipe-header">
        <button className="setup-back" onClick={() => { socket.disconnect(); clearRoom(); navigate('/mode') }}>
          ← Leave
        </button>
        <span className="swipe-header__logo">👥 FoodSwipe</span>
        <span className="swipe-header__count">{stack.length} left</span>
      </header>

      <div className="multi-match-hint">
        Swipe right when you want this — a match needs everyone to agree ❤️
      </div>

      <div className="swipe-card-area">
        <AnimatePresence>
          {visibleStack.map((food, i) => {
            const stackIndex = visibleStack.length - 1 - i
            const isTop = stackIndex === 0
            return (
              <SwipeCard
                key={food.id}
                food={food}
                isTop={isTop}
                stackIndex={stackIndex}
                onLike={handleLike}
                onSkip={handleSkip}
                onDetail={() => setShowDetail(true)}
              />
            )
          })}
        </AnimatePresence>
      </div>

      <div className="swipe-actions">
        <button className="swipe-btn swipe-btn--skip" onClick={handleSkip} aria-label="Skip (←)">✕</button>
        <button className="swipe-btn swipe-btn--detail" onClick={() => setShowDetail(true)} aria-label="Details (↑)">ℹ</button>
        <button className="swipe-btn swipe-btn--like" onClick={() => handleLike(topFood)} aria-label="Like (→)">❤️</button>
      </div>

      {showDetail && (
        <FoodDetail food={topFood} onClose={() => setShowDetail(false)} />
      )}
    </div>
  )
}
