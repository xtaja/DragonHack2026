import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaArrowRight,
  FaCakeCandles,
  FaCarrot,
  FaFish,
  FaGlobe,
  FaMosque,
  FaPepperHot,
  FaPizzaSlice,
  FaSeedling,
  FaCartShopping,
  FaUtensils,
  FaWineGlass,
} from 'react-icons/fa6'
import {
  GiCampCookingPot,
  GiTomato,
  GiPeanut,
  GiNoodles,
  GiTacos,
} from 'react-icons/gi'
import { LuCandy, LuSalad, LuFish, LuPizza, LuWine, LuVegan, LuCarrot, LuNutOff, LuMilkOff, LuWheatOff, LuMoonStar, LuX} from 'react-icons/lu'
import { MdOutlineRamenDining } from 'react-icons/md'
import { TbSalt, TbPepper, TbWheat, TbSoup, TbMilk, TbNut } from 'react-icons/tb'
import PreferenceChip from '../components/PreferenceChip'
import useAppStore from '../store/useAppStore'
import logo1 from '../assets/logo1.svg'

const PREFERENCE_GROUPS = [
  {
    label: 'Taste',
    options: [
      { label: 'Sweet', Icon: LuCandy},
      { label: 'Savory', Icon: TbSalt },
      { label: 'Spicy', Icon: TbPepper},
    ],
  },
  {
    label: 'Dish Type',
    options: [
      { label: 'Pasta', Icon: GiNoodles },
      { label: 'Soup', Icon: TbSoup },
      { label: 'Salad', Icon: LuSalad },
      { label: 'Seafood', Icon: LuFish },
    ],
  },
  {
    label: 'Cuisine',
    options: [
      { label: 'Italian', Icon: LuPizza },
      { label: 'Chinese', Icon: MdOutlineRamenDining },
      { label: 'French', Icon: LuWine },
      { label: 'Mexican', Icon: GiTacos },
      { label: 'Indian', Icon: FaGlobe },
    ],
  },
]

const RESTRICTIONS = [
  { label: 'Vegan', Icon: LuVegan },
  { label: 'Vegetarian', Icon: LuCarrot },
  { label: 'Halal', Icon: LuMoonStar },
  { label: 'Gluten-free', Icon: LuWheatOff },
  { label: 'Nut Allergy', Icon: LuNutOff },
  { label: 'Lactose-free', Icon: LuMilkOff },
]

export default function SetupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { username, preferences, restrictions, dislikes,
          setUsername, togglePreference, toggleRestriction,
          addDislike, removeDislike } = useAppStore()

  const [dislikeInput, setDislikeInput] = useState('')
  const [error, setError] = useState('')

  function handleDislikeAdd(e) {
    if (e.key === 'Enter' || e.type === 'click') {
      const val = dislikeInput.trim().toLowerCase()
      if (val) { addDislike(val); setDislikeInput('') }
    }
  }

  function handleContinue() {
    if (!username.trim()) { setError('Please enter a username to continue.'); return }
    navigate(searchParams.get('next') || '/mode')
  }

  return (
    <motion.div
      className="setup-page"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="setup-header">
        <div className="setup-logo">
        <img
          src={logo1}
          alt="Tindish"
          className="setup-logo-img"
          style={{ height: "120px", width: "auto" }}
        />

        </div>
        <p className="setup-subtitle">Find your next meal, one swipe at a time</p>
      </header>

      <div className="setup-card">
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

        <section className="setup-section">
          <label className="setup-label">
            Preferences <span className="optional">(optional)</span>
          </label>
          <p className="setup-hint">What are you in the mood for? Pick from any category.</p>
          <div className="pref-groups">
            {PREFERENCE_GROUPS.map((group) => (
              <div key={group.label} className="pref-group">
                <span className="pref-group-label">{group.label}</span>
                <div className="chip-group">
                  {group.options.map((p) => (
                    <PreferenceChip
                      key={p.label}
                      label={p.label}
                      Icon={p.Icon}
                      selected={preferences.includes(p.label)}
                      onClick={() => togglePreference(p.label)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

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
                Icon={r.Icon}
                selected={restrictions.includes(r.label)}
                onClick={() => toggleRestriction(r.label)}
              />
            ))}
          </div>
        </section>

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
            <button type="button" className="dislike-add-btn" onClick={handleDislikeAdd} disabled={!dislikeInput.trim()}>
              Add
            </button>
          </div>
          {dislikes.length > 0 && (
            <div className="chip-group chip-group--mt">
              {dislikes.map((d) => (
                <button key={d} type="button" className="chip chip--dislike chip--dislike-remove" onClick={() => removeDislike(d)}>
                  <span>{d}</span>
                  <LuX size={14} aria-hidden />
                </button>
              ))}
            </div>
          )}
        </section>

        <button type="button" className="setup-cta setup-cta--with-icon" onClick={handleContinue}>
          <span>Let's eat</span>
          <FaArrowRight size={20} aria-hidden />
        </button>
      </div>
    </motion.div>
  )
}
