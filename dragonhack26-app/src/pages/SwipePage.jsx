import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import {
  HiChevronLeft,
  HiOutlineHeart,
  HiOutlineInformationCircle,
} from 'react-icons/hi2'
import { MdRestaurant } from 'react-icons/md'
import { FaXmark } from 'react-icons/fa6'
import { TbLoader2, TbMoodSad } from 'react-icons/tb'
import SwipeCard from '../components/SwipeCard'
import FoodDetail from '../components/FoodDetail'
import { useFoodData } from '../hooks/useFoodData'
import useAppStore from '../store/useAppStore'

export default function SwipePage() {
  const navigate = useNavigate()
  const setLikedFood = useAppStore(s => s.setLikedFood)
  const { foods, loading, error } = useFoodData()

  const [stack, setStack] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  if (!loading && stack === null && foods.length > 0) {
    setStack([...foods].reverse())
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
  const visibleStack = stack?.slice(-3) ?? []

  if (loading) {
    return (
      <div className="setup-page swipe-page swipe-page--center">
        <TbLoader2 className="swipe-loading-spinner" aria-hidden />
        <p className="swipe-loading-text">Finding food for you…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="setup-page swipe-page swipe-page--center">
        <div className="setup-card setup-card--message">
          <p>Something went wrong: {error}</p>
          <button type="button" className="setup-cta" style={{ maxWidth: 220, marginTop: 16 }} onClick={() => navigate('/')}>
            Go back
          </button>
        </div>
      </div>
    )
  }

  if (!topFood) {
    return (
      <div className="setup-page swipe-page swipe-page--center">
        <div className="setup-card setup-card--message">
          <TbMoodSad style={{ fontSize: '3rem', color: 'var(--accent)' }} aria-hidden />
          <h2 style={{ color: 'var(--text-h)', margin: '12px 0 8px' }}>No more food!</h2>
          <p style={{ color: 'var(--text)', marginBottom: 8 }}>You've seen everything. Try again?</p>
          <button type="button" className="setup-cta" style={{ maxWidth: 220 }} onClick={() => navigate('/')}>
            Start over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="setup-page swipe-page">
      <header className="swipe-header">
        <button type="button" className="setup-back setup-back--with-icon" onClick={() => navigate('/mode')}>
          <HiChevronLeft size={18} aria-hidden />
          Back
        </button>
        <span className="swipe-header__brand">
          <MdRestaurant aria-hidden />
          FoodSwipe
        </span>
        <span className="swipe-header__count">{stack.length} left</span>
      </header>

      <div className="swipe-card-area">
        <div className="swipe-card-stack">
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
          <button type="button" className="swipe-btn swipe-btn--skip" onClick={handleSkip} aria-label="Skip">
            <FaXmark size={26} aria-hidden />
          </button>
          <button type="button" className="swipe-btn swipe-btn--detail" onClick={() => setShowDetail(true)} aria-label="Details">
            <HiOutlineInformationCircle size={28} aria-hidden />
          </button>
          <button type="button" className="swipe-btn swipe-btn--like" onClick={() => handleLike(topFood)} aria-label="Like">
            <HiOutlineHeart size={28} aria-hidden />
          </button>
        </div>
      </div>

      {showDetail && (
        <FoodDetail food={topFood} onClose={() => setShowDetail(false)} />
      )}
    </div>
  )
}
