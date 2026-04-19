import { useEffect, useRef, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { socket } from '../lib/socket'
import { fetchFoods } from '../hooks/useFoodData'
import useAppStore from '../store/useAppStore'

function mergePrefs(allMembers) {
  return {
    preferences: [...new Set(allMembers.flatMap(m => m.preferences || []))],
    restrictions: [...new Set(allMembers.flatMap(m => m.restrictions || []))],
    dislikes:     [...new Set(allMembers.flatMap(m => m.dislikes     || []))],
  }
}

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const { username, preferences, restrictions, dislikes,
          setRoom, setRoomMembers, setMultiplayerFoods } = useAppStore()

  if (!username.trim()) {
    return <Navigate to="/?next=%2Froom%2Fcreate" replace />
  }

  const [roomCode, setRoomCode] = useState(null)
  const [members, setMembers] = useState([])      // full member objects incl. prefs
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)
  const didCreate = useRef(false)

  useEffect(() => {
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
      socket.emit('create-room', { username, preferences, restrictions, dislikes })
    }

    return () => {
      socket.off('room-created')
      socket.off('member-joined')
      socket.off('member-left')
      socket.off('game-started')
      socket.off('room-error')
    }
  }, [])

  const joinLink = roomCode ? `${window.location.origin}/room/join?code=${roomCode}` : ''

  function handleCopyCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied('code'); setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(joinLink).then(() => {
      setCopied('link'); setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleStart() {
    setStarting(true)
    try {
      const merged = mergePrefs(members)
      const foods = await fetchFoods(merged)
      socket.emit('start-game', { roomCode, foods })
    } catch {
      setError('Failed to fetch recipes. Try again.')
      setStarting(false)
    }
  }

  function handleLeave() {
    socket.disconnect()
    navigate('/multiplayer')
  }

  // Build a readable summary of merged prefs for the lobby
  const merged = mergePrefs(members)
  const prefSummary = [
    merged.preferences.length ? `Preferences: ${merged.preferences.join(', ')}` : null,
    merged.restrictions.length ? `Restrictions: ${merged.restrictions.join(', ')}` : null,
    merged.dislikes.length ? `Avoiding: ${merged.dislikes.join(', ')}` : null,
  ].filter(Boolean)

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
            <>
              <div className="room-code-row">
                <span className="room-code">{roomCode}</span>
                <button className="dislike-add-btn" onClick={handleCopyCode}>
                  {copied === 'code' ? '✓ Copied' : 'Copy code'}
                </button>
              </div>
              <div className="room-link-row">
                <span className="room-link">{joinLink}</span>
                <button className="dislike-add-btn" onClick={handleCopyLink}>
                  {copied === 'link' ? '✓ Copied' : 'Copy link'}
                </button>
              </div>
              <div className="room-qr">
                <QRCodeSVG value={joinLink} size={160} includeMargin />
              </div>
            </>
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

        {/* Merged prefs summary */}
        {members.length > 1 && prefSummary.length > 0 && (
          <section className="setup-section">
            <label className="setup-label">Combined preferences</label>
            {prefSummary.map((line, i) => (
              <p key={i} className="setup-hint" style={{ margin: 0 }}>{line}</p>
            ))}
          </section>
        )}

        <button
          className="setup-cta"
          onClick={handleStart}
          disabled={members.length < 2 || starting}
        >
          {starting ? 'Fetching recipes…' : `Start Game (${members.length} players)`}
        </button>

        <button className="setup-back" onClick={handleLeave} style={{ alignSelf: 'center' }}>
          ← Leave room
        </button>
      </div>
    </motion.div>
  )
}
