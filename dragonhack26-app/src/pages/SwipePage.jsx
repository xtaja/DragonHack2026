import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SwipeCard from '../components/SwipeCard'
import FoodDetail from '../components/FoodDetail'
import { useFoodData } from '../hooks/useFoodData'
import useAppStore from '../store/useAppStore'

export default function SwipePage() {
  const navigate = useNavigate()
  const setLikedFood = useAppStore(s => s.setLikedFood)
  const { foods, loading, error } = useFoodData()

  const [stack, setStack] = useState(null)    // null = not initialised yet
  const [showDetail, setShowDetail] = useState(false)

  // Initialise stack from foods once loaded
  if (!loading && stack === null && foods.length > 0) {
    setStack([...foods].reverse()) // last item = top card
  }

  function handleLike(food) {
    setLikedFood(food)
    navigate('/result')
  }

  function handleSkip() {
    setStack(s => s.slice(0, -1))
  }

  const topFood = stack?.[stack.length - 1]

  useEffect(() => {
    function onKey(e) {
      if (!topFood || showDetail) return
      if (e.key === 'ArrowRight' || e.key === 'l') handleLike(topFood)
      if (e.key === 'ArrowLeft'  || e.key === 'h') handleSkip()
      if (e.key === 'ArrowUp'    || e.key === 'k') setShowDetail(true)
      if (e.key === 'Escape') setShowDetail(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [topFood, showDetail])
  const visibleStack = stack?.slice(-3) ?? []  // render at most 3 cards

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="swipe-page swipe-page--center">
        <div className="swipe-spinner">🍽️</div>
        <p className="swipe-loading-text">Finding food for you…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="swipe-page swipe-page--center">
        <p>Something went wrong: {error}</p>
        <button className="setup-cta" style={{ maxWidth: 200, marginTop: 16 }} onClick={() => navigate('/')}>
          Go back
        </button>
      </div>
    )
  }

  // ── Empty / finished ─────────────────────────────────────
  if (!topFood) {
    return (
      <div className="swipe-page swipe-page--center">
        <div style={{ fontSize: 56 }}>😅</div>
        <h2 style={{ color: 'var(--text-h)', margin: '12px 0 8px' }}>No more food!</h2>
        <p style={{ color: 'var(--text)', marginBottom: 24 }}>You've seen everything. Try again?</p>
        <button className="setup-cta" style={{ maxWidth: 200 }} onClick={() => navigate('/')}>
          Start over
        </button>
      </div>
    )
  }

  // ── Main swipe view ──────────────────────────────────────
  return (
    <div className="swipe-page">
      <header className="swipe-header">
        <button className="setup-back" onClick={() => navigate('/mode')}>← Back</button>
        <span className="swipe-header__logo">🍽️ FoodSwipe</span>
        <span className="swipe-header__count">{stack.length} left</span>
      </header>

      <div className="swipe-card-area">
        <AnimatePresence>
          {visibleStack.map((food, i) => {
            const stackIndex = visibleStack.length - 1 - i  // 0 = top
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
        <button className="swipe-btn swipe-btn--skip" onClick={handleSkip} aria-label="Skip (←)">
          ✕
        </button>
        <button className="swipe-btn swipe-btn--detail" onClick={() => setShowDetail(true)} aria-label="Details (↑)">
          ℹ
        </button>
        <button className="swipe-btn swipe-btn--like" onClick={() => handleLike(topFood)} aria-label="Like (→)">
          ❤️
        </button>
      </div>

      {showDetail && (
        <FoodDetail food={topFood} onClose={() => setShowDetail(false)} />
      )}
    </div>
  )
}
