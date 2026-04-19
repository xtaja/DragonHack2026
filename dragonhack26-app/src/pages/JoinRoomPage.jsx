import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiChevronLeft } from 'react-icons/hi2'
import { MdHourglassEmpty, MdVpnKey } from 'react-icons/md'
import { TbLoader2 } from 'react-icons/tb'
import { socket } from '../lib/socket'
import useAppStore from '../store/useAppStore'

export default function JoinRoomPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { username, preferences, restrictions, dislikes,
          setRoom, setRoomMembers, setMultiplayerFoods } = useAppStore()

  const codeFromUrl = searchParams.get('code') || ''
  const [code, setCode] = useState(codeFromUrl)

  if (!username.trim()) {
    const next = codeFromUrl ? `/room/join?code=${codeFromUrl}` : '/room/join'
    return <Navigate to={`/?next=${encodeURIComponent(next)}`} replace />
  }
  const [joined, setJoined] = useState(false)
  const [roomCode, setRoomCode] = useState(null)
  const [members, setMembers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    socket.connect()

    socket.on('room-joined', ({ code, members }) => {
      setRoomCode(code)
      setMembers(members)
      setRoom(code, false)
      setRoomMembers(members)
      setJoined(true)
    })

    socket.on('member-joined', ({ members }) => {
      setMembers(members)
      setRoomMembers(members)
    })

    socket.on('member-left', ({ members }) => {
      setMembers(members)
      setRoomMembers(members)
    })

    socket.on('game-started', ({ foods }) => {
      setMultiplayerFoods(foods)
      navigate('/multi-swipe')
    })

    socket.on('room-error', ({ message }) => setError(message))

    return () => {
      socket.off('room-joined')
      socket.off('member-joined')
      socket.off('member-left')
      socket.off('game-started')
      socket.off('room-error')
    }
  }, [])

  function handleJoin() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setError(null)
    socket.emit('join-room', { roomCode: trimmed, username, preferences, restrictions, dislikes })
  }

  function handleLeave() {
    socket.disconnect()
    navigate('/multiplayer')
  }

  if (joined) {
    return (
      <motion.div
        className="setup-page"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <header className="setup-header">
          <div className="setup-logo setup-logo--icon">
            <MdHourglassEmpty size={52} aria-hidden />
          </div>
          <h1 className="setup-title">Room {roomCode}</h1>
          <p className="setup-subtitle">Waiting for the host to start…</p>
        </header>

        <div className="setup-card">
          <section className="setup-section">
            <label className="setup-label">Players ({members.length})</label>
            <ul className="member-list">
              {members.map((m, i) => (
                <li key={i} className="member-row">
                  <span className="member-avatar">{m.username[0]?.toUpperCase()}</span>
                  <span className="member-name">{m.username}</span>
                  {i === 0 && <span className="member-badge">Host</span>}
                </li>
              ))}
            </ul>
          </section>

          <div className="lobby-waiting">
            <TbLoader2 className="lobby-waiting-spinner" aria-hidden />
            <p>Waiting for host to start the game…</p>
          </div>

          <button type="button" className="setup-back setup-back--with-icon" onClick={handleLeave} style={{ alignSelf: 'center' }}>
            <HiChevronLeft size={18} aria-hidden />
            Leave room
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="setup-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="setup-header">
        <div className="setup-logo setup-logo--icon">
          <MdVpnKey size={52} aria-hidden />
        </div>
        <h1 className="setup-title">Join Room</h1>
        <p className="setup-subtitle">Enter the code your friend shared</p>
      </header>

      <div className="setup-card">
        <section className="setup-section">
          <label className="setup-label" htmlFor="room-code">Room Code</label>
          <div className="dislike-input-row">
            <input
              id="room-code"
              className={`setup-input room-code-input ${error ? 'setup-input--error' : ''}`}
              type="text"
              placeholder="e.g. K4T2WX"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(null) }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              maxLength={8}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="dislike-add-btn"
              onClick={handleJoin}
              disabled={!code.trim()}
            >
              Join
            </button>
          </div>
          {error && (
            <div>
              <p className="setup-error">{error}</p>
              {error.includes('already taken') && (
                <button
                  type="button"
                  className="setup-back setup-back--with-icon"
                  style={{ marginTop: 8 }}
                  onClick={() => navigate(`/?next=${encodeURIComponent(`/room/join?code=${code}`)}`)}
                >
                  <HiChevronLeft size={18} aria-hidden />
                  Change username
                </button>
              )}
            </div>
          )}
        </section>

        <button type="button" className="setup-back setup-back--with-icon" onClick={handleLeave} style={{ alignSelf: 'center' }}>
          <HiChevronLeft size={18} aria-hidden />
          Back
        </button>
      </div>
    </motion.div>
  )
}
