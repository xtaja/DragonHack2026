import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { socket } from '../lib/socket'
import useAppStore from '../store/useAppStore'

export default function JoinRoomPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { username, preferences, restrictions, dislikes,
          setRoom, setRoomMembers, setMultiplayerFoods } = useAppStore()

  const codeFromUrl = searchParams.get('code') || ''
  const [code, setCode] = useState(codeFromUrl)

  // Redirect to setup if no username, preserving this page as destination
  if (!username.trim()) {
    const next = codeFromUrl ? `/room/join?code=${codeFromUrl}` : '/room/join'
    return <Navigate to={`/?next=${encodeURIComponent(next)}`} replace />
  }
  const [joined, setJoined] = useState(false)
  const [roomCode, setRoomCode] = useState(null)
  const [members, setMembers] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    socket.connect()   // no-op if already connected; safe to call every mount

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

  // ── Lobby (after joining) ──────────────────────────────────
  if (joined) {
    return (
      <motion.div
        className="setup-page"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <header className="setup-header">
          <div className="setup-logo">⏳</div>
          <h1 className="setup-title">Room {roomCode}</h1>
          <p className="setup-subtitle">Waiting for the host to start…</p>
        </header>

        <div className="setup-card" style={{ maxWidth: 420 }}>
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
            <span className="swipe-spinner" style={{ fontSize: '1.8rem' }}>⏳</span>
            <p>Waiting for host to start the game…</p>
          </div>

          <button className="setup-back" onClick={handleLeave} style={{ alignSelf: 'center' }}>
            ← Leave room
          </button>
        </div>
      </motion.div>
    )
  }

  // ── Code entry ─────────────────────────────────────────────
  return (
    <motion.div
      className="setup-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="setup-header">
        <div className="setup-logo">🔑</div>
        <h1 className="setup-title">Join Room</h1>
        <p className="setup-subtitle">Enter the code your friend shared</p>
      </header>

      <div className="setup-card" style={{ maxWidth: 420 }}>
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
                  className="setup-back"
                  style={{ marginTop: 8 }}
                  onClick={() => navigate(`/?next=${encodeURIComponent(`/room/join?code=${code}`)}`)}
                >
                  ← Change username
                </button>
              )}
            </div>
          )}
        </section>

        <button className="setup-back" onClick={handleLeave} style={{ alignSelf: 'center' }}>
          ← Back
        </button>
      </div>
    </motion.div>
  )
}
