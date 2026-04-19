import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  HiChevronLeft,
  HiOutlineHeart,
  HiOutlineInformationCircle,
} from 'react-icons/hi2'
import { FaArrowRight, FaBookOpen, FaXmark, FaYoutube } from 'react-icons/fa6'
import { MdCelebration } from 'react-icons/md'
import { TbMoodSad } from 'react-icons/tb'
import SwipeCard from '../components/SwipeCard'
import FoodDetail from '../components/FoodDetail'
import NearbyRestaurants from '../components/NearbyRestaurants'
import { socket } from '../lib/socket'
import { fetchFoods } from '../hooks/useFoodData'
import useAppStore from '../store/useAppStore'
import logo1 from '../assets/logo1.svg'

const MEDALS = ['🥇', '🥈', '🥉']

export default function MultiSwipePage() {
  const navigate = useNavigate()
  const { multiplayerFoods, roomCode, isHost, setLikedFood, setMultiplayerFoods, clearRoom } = useAppStore()

  const [stack, setStack] = useState(() => [...multiplayerFoods].reverse())
  const [showDetail, setShowDetail] = useState(false)
  const [matchBanner, setMatchBanner] = useState(null)
  const [waiting, setWaiting] = useState(false)
  const [scores, setScores] = useState(null)
  const [fetchingNextRound, setFetchingNextRound] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const doneSent = useRef(false)
  const topFood = stack[stack.length - 1]
  const visibleStack = stack.slice(-3)

  useEffect(() => {
    if (!roomCode) { navigate('/multiplayer'); return }

    function onKey(e) {
      if (!topFood || showDetail || waiting) return
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

    socket.on('game-over', ({ scores }) => {
      setScores(scores)
    })

    socket.on('game-started', ({ foods }) => {
      setMultiplayerFoods(foods)
      setStack([...foods].reverse())
      setScores(null)
      setWaiting(false)
      setMatchBanner(null)
      setFetchingNextRound(false)
      doneSent.current = false
    })

    return () => {
      window.removeEventListener('keydown', onKey)
      socket.off('match-found')
      socket.off('game-over')
      socket.off('game-started')
    }
  }, [topFood, showDetail, waiting, roomCode])

  // Emit player-done when deck runs out
  useEffect(() => {
    if (stack.length === 0 && !doneSent.current && !matchBanner && roomCode) {
      doneSent.current = true
      socket.emit('player-done', { roomCode })
      setWaiting(true)
    }
  }, [stack.length])

  function handleLike(food) {
    socket.emit('swipe-right', { roomCode, foodId: food.id })
    setStack(s => s.slice(0, -1))
  }

  function handleSkip() {
    setStack(s => s.slice(0, -1))
  }

  function handleLeave() {
    socket.disconnect()
    clearRoom()
    navigate('/mode')
  }

  async function handlePlayAgain() {
    setFetchingNextRound(true)
    try {
      const foods = await fetchFoods()
      socket.emit('start-game', { roomCode, foods })
    } catch {
      setFetchingNextRound(false)
    }
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
      <motion.div className="result-page" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
        <div className="result-card">
          <div className="result-match-badge result-match-badge-row">
            <MdCelebration size={20} aria-hidden />
            It's a Match!
          </div>

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
                <FaBookOpen size={20} aria-hidden />
                View Full Recipe
              </a>
            )}
            {matchBanner.youtubeUrl && (
              <a href={matchBanner.youtubeUrl} target="_blank" rel="noopener noreferrer" className="result-link-btn result-link-btn--yt">
                <FaYoutube size={22} aria-hidden />
                Watch on YouTube
              </a>
            )}
            {!matchBanner.recipeUrl && !matchBanner.youtubeUrl && (
              <p style={{ color: 'var(--text)', fontSize: '0.9rem' }}>No recipe link available.</p>
            )}
          </div>
          <NearbyRestaurants foodName={matchBanner.name} category={matchBanner.area || matchBanner.category} />

          <button type="button" className="setup-cta setup-cta--with-icon" onClick={handleContinue}>
            <span>Done</span>
            <FaArrowRight size={20} aria-hidden />
          </button>
        </div>
      </motion.div>
    )
  }

  // ── Leaderboard (game over, no match) ─────────────────────
  if (scores !== null) {
    const totalPlayers = multiplayerFoods.length > 0 ? multiplayerFoods.length : 1
    const rankedFoods = scores
      .filter(s => s.count > 0)
      .map(s => ({ ...multiplayerFoods.find(f => f.id === s.foodId), count: s.count }))
      .filter(Boolean)

    return (
      <motion.div className="setup-page" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <header className="setup-header">
          <div className="setup-logo">
            <img src={logo1} alt="" className="setup-logo-img setup-logo-img--board" width={173} height={113} />
          </div>
          <h1 className="setup-title">No Match Found</h1>
          <p className="setup-subtitle">Here's what everyone liked</p>
        </header>

        <div className="setup-card" style={{ maxWidth: 480 }}>
          {rankedFoods.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text)' }}>Nobody liked anything 😅</p>
          ) : (
            <ul className="leaderboard">
              {rankedFoods.map((food, i) => {
                const isOpen = expandedId === food.id
                return (
                  <li key={food.id} className="leaderboard-item">
                    <button
                      className={`leaderboard-row leaderboard-row--clickable ${isOpen ? 'leaderboard-row--open' : ''}`}
                      onClick={() => setExpandedId(isOpen ? null : food.id)}
                    >
                      <span className="leaderboard-rank">{i < 3 ? MEDALS[i] : `#${i + 1}`}</span>
                      <img src={food.image} alt={food.name} className="leaderboard-thumb" />
                      <div className="leaderboard-info">
                        <span className="leaderboard-name">{food.name}</span>
                        <span className="leaderboard-category">{food.category}{food.area ? ` · ${food.area}` : ''}</span>
                      </div>
                      <div className="leaderboard-likes">
                        <span className="leaderboard-count">{food.count}</span>
                        <span className="leaderboard-label">like{food.count !== 1 ? 's' : ''}</span>
                      </div>
                      <span className="leaderboard-chevron">{isOpen ? '▲' : '▼'}</span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          className="leaderboard-detail"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                          <img src={food.image} alt={food.name} className="leaderboard-detail-img" />
                          <div className="result-links">
                            {food.recipeUrl && (
                              <a href={food.recipeUrl} target="_blank" rel="noopener noreferrer" className="result-link-btn result-link-btn--primary">
                                📖 View Full Recipe
                              </a>
                            )}
                            {food.youtubeUrl && (
                              <a href={food.youtubeUrl} target="_blank" rel="noopener noreferrer" className="result-link-btn result-link-btn--yt">
                                ▶ Watch on YouTube
                              </a>
                            )}
                            {!food.recipeUrl && !food.youtubeUrl && (
                              <p style={{ color: 'var(--text)', fontSize: '0.9rem', textAlign: 'center' }}>No recipe link available.</p>
                            )}
                          </div>
                          <NearbyRestaurants foodName={food.name} category={food.area || food.category} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>
          )}

          {isHost ? (
            <button className="setup-cta" onClick={handlePlayAgain} disabled={fetchingNextRound}>
              {fetchingNextRound ? 'Loading new recipes…' : '🔄 Swipe Again'}
            </button>
          ) : (
            <div className="lobby-waiting">
              <span className="swipe-spinner" style={{ fontSize: '1.4rem' }}>⏳</span>
              <p>Waiting for host to start a new round…</p>
            </div>
          )}

          <button className="setup-back" style={{ alignSelf: 'center' }} onClick={handleLeave}>← Leave room</button>
        </div>
      </motion.div>
    )
  }

  // ── Waiting for others ─────────────────────────────────────
  if (waiting) {
    return (
      <div className="swipe-page swipe-page--center">
        <div className="swipe-spinner" style={{ fontSize: '3rem' }}>⏳</div>
        <h2 style={{ color: 'var(--text-h)', margin: '12px 0 4px' }}>You're done!</h2>
        <p style={{ color: 'var(--text)' }}>Waiting for the others to finish…</p>
        <button className="setup-back" style={{ marginTop: 24 }} onClick={handleLeave}>← Leave</button>
      </div>
    )
  }

  return (
    <div className="setup-page swipe-page">
      <header className="swipe-header">
        <div className="swipe-header__side swipe-header__side--left">
          <button type="button" className="setup-back setup-back--with-icon" onClick={handleLeave}>
            <HiChevronLeft size={18} aria-hidden />
            Leave
          </button>
        </div>
        <div className="swipe-header__center">
          <img src={logo1} alt="" className="swipe-header__logo-img" width={173} height={113} />
        </div>
        <div className="swipe-header__side swipe-header__side--right">
          <span className="swipe-header__count">{stack.length} left</span>
        </div>
      </header>

      <div className="multi-match-hint multi-match-hint-row">
        <span>Swipe right when you want this — a match needs everyone to agree</span>
        <HiOutlineHeart size={16} aria-hidden className="multi-match-hint__icon" />
      </div>

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

      {showDetail && <FoodDetail food={topFood} onClose={() => setShowDetail(false)} />}
    </div>
  )
}
