import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAppStore from '../store/useAppStore'
import NearbyRestaurants from '../components/NearbyRestaurants'

export default function ResultPage() {
  const navigate = useNavigate()
  const food = useAppStore(s => s.likedFood)

  if (!food) {
    navigate('/')
    return null
  }

  return (
    <motion.div
      className="result-page"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="result-card">
        <div className="result-match-badge">❤️ You picked this!</div>

        <img src={food.image} alt={food.name} className="result-img" />

        <div className="result-info">
          <div className="swipe-card__tags" style={{ justifyContent: 'center', marginBottom: 8 }}>
            <span className="swipe-tag">{food.category}</span>
            {food.area && <span className="swipe-tag swipe-tag--muted">{food.area}</span>}
          </div>
          <h1 className="result-name">{food.name}</h1>

          {food.ingredients.length > 0 && (
            <p className="result-ingredients">
              {food.ingredients.slice(0, 5).map(i => i.name).join(', ')}
              {food.ingredients.length > 5 ? ` +${food.ingredients.length - 5} more` : ''}
            </p>
          )}
        </div>

        <div className="result-links">
          {food.recipeUrl && (
            <a
              href={food.recipeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="result-link-btn result-link-btn--primary"
            >
              📖 View Full Recipe
            </a>
          )}
          {food.youtubeUrl && (
            <a
              href={food.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="result-link-btn result-link-btn--yt"
            >
              ▶ Watch on YouTube
            </a>
          )}
          {!food.recipeUrl && !food.youtubeUrl && (
            <p style={{ color: 'var(--text)', fontSize: '0.9rem' }}>No recipe link available.</p>
          )}
        </div>

        <NearbyRestaurants foodName={food.name} category={food.area || food.category} />

        <button className="setup-back" onClick={() => navigate('/swipe')}>
          ← Keep swiping
        </button>
      </div>
    </motion.div>
  )
}
