import { motion, AnimatePresence } from 'framer-motion'

export default function FoodDetail({ food, onClose }) {
  if (!food) return null

  return (
    <AnimatePresence>
      <motion.div
        className="detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="detail-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="detail-handle" />

          <div className="detail-inner">
          <div className="detail-header">
            <img src={food.image} alt={food.name} className="detail-thumb" />
            <div>
              <h2 className="detail-name">{food.name}</h2>
              <div className="swipe-card__tags" style={{ marginTop: 6 }}>
                <span className="swipe-tag">{food.category}</span>
                {food.area && <span className="swipe-tag swipe-tag--muted">{food.area}</span>}
                {food.tags.map(t => (
                  <span key={t} className="swipe-tag swipe-tag--muted">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <section className="detail-section">
            <h3 className="detail-section-title">Ingredients</h3>
            <ul className="detail-ingredients">
              {food.ingredients.map((ing, i) => (
                <li key={i} className="detail-ingredient-row">
                  <span className="detail-ingredient-name">{ing.name}</span>
                  {ing.measure && (
                    <span className="detail-ingredient-measure">{ing.measure}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {food.instructions && (
            <section className="detail-section">
              <h3 className="detail-section-title">Instructions</h3>
              <p className="detail-instructions">
                {food.instructions.slice(0, 300)}
                {food.instructions.length > 300 ? '…' : ''}
              </p>
            </section>
          )}

          <button className="detail-close" onClick={onClose}>Close ↓</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
