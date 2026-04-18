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
      setTimeout(() => {
        setLikedFood(food)
        socket.disconnect()
        clearRoom()
        navigate('/result')
      }, 2200)
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

  // ── Match banner ───────────────────────────────────────────
  if (matchBanner) {
    return (
      <motion.div
        className="swipe-page swipe-page--center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div style={{ fontSize: 64 }}>🎉</div>
        <h2 style={{ color: 'var(--text-h)', margin: '12px 0 4px', fontSize: '1.8rem' }}>It's a Match!</h2>
        <p style={{ color: 'var(--text)', marginBottom: 16 }}>Everyone picked the same food!</p>
        <img
          src={matchBanner.image}
          alt={matchBanner.name}
          style={{ width: 220, height: 160, objectFit: 'cover', borderRadius: 16, boxShadow: 'var(--shadow)' }}
        />
        <p style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-h)', marginTop: 12 }}>
          {matchBanner.name}
        </p>
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
