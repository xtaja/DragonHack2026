import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAppStore from '../store/useAppStore'

export default function MultiplayerPage() {
  const navigate = useNavigate()
  const username = useAppStore(s => s.username)

  return (
    <motion.div
      className="setup-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="setup-header">
        <div className="setup-logo">👥</div>
        <h1 className="setup-title">Multiplayer</h1>
        <p className="setup-subtitle">Find a meal everyone agrees on</p>
      </header>

      <div className="mode-card-group">
        <button className="mode-card" onClick={() => navigate('/room/create')}>
          <span className="mode-card__emoji">🏠</span>
          <span className="mode-card__title">Create a Room</span>
          <span className="mode-card__desc">Get a code and invite friends</span>
        </button>
        <button className="mode-card" onClick={() => navigate('/room/join')}>
          <span className="mode-card__emoji">🔑</span>
          <span className="mode-card__title">Join a Room</span>
          <span className="mode-card__desc">Enter a room code from a friend</span>
        </button>
      </div>

      <button className="setup-back" onClick={() => navigate('/mode')}>← Back</button>
    </motion.div>
  )
}
