import { useMotionValue, useTransform, motion, animate } from 'framer-motion'

const SWIPE_X = 90
const SWIPE_UP = 70

export default function SwipeCard({ food, onLike, onSkip, onDetail, isTop, stackIndex = 0 }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-260, 260], [-20, 20])
  const likeOpacity = useTransform(x, [20, SWIPE_X], [0, 1])
  const skipOpacity = useTransform(x, [-20, -SWIPE_X], [0, 1])

  const backScale = 1 - stackIndex * 0.05
  const backY = stackIndex * 16

  async function handleDragEnd(_, info) {
    const ox = info.offset.x
    const oy = info.offset.y
    if (ox > SWIPE_X) {
      await animate(x, window.innerWidth + 300, { duration: 0.28 })
      onLike(food)
    } else if (ox < -SWIPE_X) {
      await animate(x, -(window.innerWidth + 300), { duration: 0.28 })
      onSkip()
    } else if (oy < -SWIPE_UP) {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 })
      onDetail()
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
      animate(y, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  return (
    <motion.div
      className={`swipe-card${isTop ? ' swipe-card--draggable' : ''}`}
      style={isTop ? { x, y, rotate } : undefined}
      animate={{ scale: isTop ? 1 : backScale, y: isTop ? 0 : backY }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      whileDrag={{ cursor: 'grabbing' }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.75}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <img src={food.image} alt={food.name} className="swipe-card__img" loading="lazy" />

      {isTop && (
        <>
          <motion.div className="swipe-label swipe-label--like" style={{ opacity: likeOpacity }}>
            ❤️ LIKE
          </motion.div>
          <motion.div className="swipe-label swipe-label--skip" style={{ opacity: skipOpacity }}>
            ✕ SKIP
          </motion.div>
        </>
      )}

      <div className="swipe-card__bottom">
        <div className="swipe-card__tags">
          <span className="swipe-tag">{food.category}</span>
          {food.area && <span className="swipe-tag swipe-tag--muted">{food.area}</span>}
        </div>
        <h2 className="swipe-card__name">{food.name}</h2>
        {isTop && <p className="swipe-card__hint">↑ drag up for details · ← → or arrow keys</p>}
      </div>
    </motion.div>
  )
}
