import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAppStore from '../store/useAppStore'

export default function ModePage() {
  const navigate = useNavigate()
  const username = useAppStore((s) => s.username)

  return (
    <motion.div
      className="setup-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="setup-header">
        <div className="setup-logo">🍽️</div>
        <h1 className="setup-title">Hey, {username}!</h1>
        <p className="setup-subtitle">How do you want to play?</p>
      </header>

      <div className="mode-card-group">
        <button className="mode-card" onClick={() => navigate('/swipe')}>
          <span className="mode-card__emoji">🧑</span>
          <span className="mode-card__title">Solo</span>
          <span className="mode-card__desc">Find food just for you</span>
        </button>
        <button className="mode-card" onClick={() => navigate('/multiplayer')}>
          <span className="mode-card__emoji">👥</span>
          <span className="mode-card__title">Multiplayer</span>
          <span className="mode-card__desc">Agree on a meal with friends</span>
        </button>
      </div>

      <button className="setup-back" onClick={() => navigate('/')}>
        ← Back
      </button>
    </motion.div>
  )
}
