import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { socket } from '../lib/socket'
import { useFoodData } from '../hooks/useFoodData'
import useAppStore from '../store/useAppStore'

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const username = useAppStore(s => s.username)
  const { setRoom, setRoomMembers, setMultiplayerFoods } = useAppStore()

  const [roomCode, setRoomCode] = useState(null)
  const [members, setMembers] = useState([])
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const didCreate = useRef(false)

  // Prefetch foods while the lobby is open so start is instant
  const { foods, loading: foodsLoading } = useFoodData()

  useEffect(() => {
    // Register listeners first, then emit — also guards against StrictMode double-fire
    socket.on('room-created', ({ code, members }) => {
      setRoomCode(code)
      setMembers(members)
      setRoom(code, true)
      setRoomMembers(members)
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

    if (!didCreate.current) {
      didCreate.current = true
      socket.connect()
      socket.emit('create-room', { username })
    }

    return () => {
      socket.off('room-created')
      socket.off('member-joined')
      socket.off('member-left')
      socket.off('game-started')
      socket.off('room-error')
    }
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleStart() {
    if (!foods.length) return
    socket.emit('start-game', { roomCode, foods })
  }

  function handleLeave() {
    socket.disconnect()
    navigate('/multiplayer')
  }

  return (
    <motion.div
      className="setup-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="setup-header">
        <div className="setup-logo">🏠</div>
        <h1 className="setup-title">Your Room</h1>
        <p className="setup-subtitle">Share the code and wait for friends</p>
      </header>

      <div className="setup-card" style={{ maxWidth: 420 }}>
        {error && <p className="setup-error">{error}</p>}

        {/* Room code */}
        <section className="setup-section">
          <label className="setup-label">Room Code</label>
          {roomCode ? (
            <div className="room-code-row">
              <span className="room-code">{roomCode}</span>
              <button className="dislike-add-btn" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          ) : (
            <p className="setup-hint">Creating room…</p>
          )}
        </section>

        {/* Members */}
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
          {members.length < 2 && (
            <p className="setup-hint">Waiting for at least 1 more player…</p>
          )}
        </section>

        <button
          className="setup-cta"
          onClick={handleStart}
          disabled={members.length < 2 || foodsLoading || !foods.length}
        >
          {foodsLoading ? 'Loading food…' : `Start Game (${members.length} players)`}
        </button>

        <button className="setup-back" onClick={handleLeave} style={{ alignSelf: 'center' }}>
          ← Leave room
        </button>
      </div>
    </motion.div>
  )
}
