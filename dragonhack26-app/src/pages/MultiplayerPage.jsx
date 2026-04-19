import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiChevronLeft } from 'react-icons/hi2'
import { MdGroups, MdHome, MdVpnKey } from 'react-icons/md'
export default function MultiplayerPage() {
  const navigate = useNavigate()

  return (
    <motion.div
      className="setup-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="setup-header">
        <div className="setup-logo setup-logo--icon">
          <MdGroups size={52} aria-hidden />
        </div>
        <h1 className="setup-title">Multiplayer</h1>
        <p className="setup-subtitle">Find a meal everyone agrees on</p>
      </header>

      <div className="setup-card">
        <div className="mode-card-group">
          <button type="button" className="mode-card" onClick={() => navigate('/room/create')}>
            <span className="mode-card__icon">
              <MdHome aria-hidden />
            </span>
            <span className="mode-card__title">Create a Room</span>
            <span className="mode-card__desc">Get a code and invite friends</span>
          </button>
          <button type="button" className="mode-card" onClick={() => navigate('/room/join')}>
            <span className="mode-card__icon">
              <MdVpnKey aria-hidden />
            </span>
            <span className="mode-card__title">Join a Room</span>
            <span className="mode-card__desc">Enter a room code from a friend</span>
          </button>
        </div>

        <button type="button" className="setup-back setup-back--with-icon" onClick={() => navigate('/mode')}>
          <HiChevronLeft size={18} aria-hidden />
          Back
        </button>
      </div>
    </motion.div>
  )
}
