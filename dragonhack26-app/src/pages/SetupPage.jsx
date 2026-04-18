import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PreferenceChip from '../components/PreferenceChip'
import useAppStore from '../store/useAppStore'

const PREFERENCES = [
  { label: 'Sweet', emoji: '🍬' },
  { label: 'Savory', emoji: '🧂' },
  { label: 'Breakfast', emoji: '🍳' },
  { label: 'Snack', emoji: '🍿' },
  { label: 'Healthy', emoji: '🥗' },
  { label: 'Asian', emoji: '🍜' },
  { label: 'Seafood', emoji: '🦞' },
  { label: 'Pasta', emoji: '🍝' },
]

const RESTRICTIONS = [
  { label: 'Vegan', emoji: '🌱' },
  { label: 'Vegetarian', emoji: '🥦' },
  { label: 'Gluten-free', emoji: '🌾' },
  { label: 'Nut Allergy', emoji: '🥜' },
  { label: 'Lactose-free', emoji: '🥛' },
  { label: 'Halal', emoji: '☪️' },
]

export default function SetupPage() {
  const navigate = useNavigate()
  const { username, preferences, restrictions, dislikes,
          setUsername, togglePreference, toggleRestriction,
          addDislike, removeDislike } = useAppStore()

  const [dislikeInput, setDislikeInput] = useState('')
  const [error, setError] = useState('')

  function handleDislikeAdd(e) {
    if (e.key === 'Enter' || e.type === 'click') {
      const val = dislikeInput.trim().toLowerCase()
      if (val) {
        addDislike(val)
        setDislikeInput('')
      }
    }
  }

  function handleContinue() {
    if (!username.trim()) {
      setError('Please enter a username to continue.')
      return
    }
    navigate('/mode')
  }

  return (
    <motion.div
      className="setup-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="setup-header">
        <div className="setup-logo">🍽️</div>
        <h1 className="setup-title">FoodSwipe</h1>
        <p className="setup-subtitle">Find your next meal, one swipe at a time</p>
      </header>

      <div className="setup-card">
        {/* Username */}
        <section className="setup-section">
          <label className="setup-label" htmlFor="username">
            Your name <span className="required">*</span>
          </label>
          <input
            id="username"
            className={`setup-input ${error ? 'setup-input--error' : ''}`}
            type="text"
            placeholder="e.g. Alex"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            maxLength={32}
          />
          {error && <p className="setup-error">{error}</p>}
        </section>

        {/* Preferences */}
        <section className="setup-section">
          <label className="setup-label">
            Preferences <span className="optional">(optional)</span>
          </label>
          <p className="setup-hint">What are you in the mood for?</p>
          <div className="chip-group">
            {PREFERENCES.map((p) => (
              <PreferenceChip
                key={p.label}
                label={p.label}
                emoji={p.emoji}
                selected={preferences.includes(p.label)}
                onClick={() => togglePreference(p.label)}
              />
            ))}
          </div>
        </section>

        {/* Restrictions */}
        <section className="setup-section">
          <label className="setup-label">
            Dietary restrictions <span className="optional">(optional)</span>
          </label>
          <p className="setup-hint">We'll filter out foods that don't fit.</p>
          <div className="chip-group">
            {RESTRICTIONS.map((r) => (
              <PreferenceChip
                key={r.label}
                label={r.label}
                emoji={r.emoji}
                selected={restrictions.includes(r.label)}
                onClick={() => toggleRestriction(r.label)}
              />
            ))}
          </div>
        </section>

        {/* Dislikes */}
        <section className="setup-section">
          <label className="setup-label">
            Ingredients to avoid <span className="optional">(optional)</span>
          </label>
          <p className="setup-hint">Type an ingredient and press Enter.</p>
          <div className="dislike-input-row">
            <input
              className="setup-input"
              type="text"
              placeholder="e.g. tomato, lamb..."
              value={dislikeInput}
              onChange={(e) => setDislikeInput(e.target.value)}
              onKeyDown={handleDislikeAdd}
            />
            <button
              type="button"
              className="dislike-add-btn"
              onClick={handleDislikeAdd}
              disabled={!dislikeInput.trim()}
            >
              Add
            </button>
          </div>
          {dislikes.length > 0 && (
            <div className="chip-group chip-group--mt">
              {dislikes.map((d) => (
                <button
                  key={d}
                  type="button"
                  className="chip chip--dislike"
                  onClick={() => removeDislike(d)}
                >
                  {d} ✕
                </button>
              ))}
            </div>
          )}
        </section>

        <button className="setup-cta" onClick={handleContinue}>
          Let's eat →
        </button>
      </div>
    </motion.div>
  )
}
