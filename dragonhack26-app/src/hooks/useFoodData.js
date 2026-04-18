import { useState, useEffect } from 'react'
import useAppStore from '../store/useAppStore'
import { fetchMealsByCategory, fetchMealsByArea, fetchMealDetail } from '../lib/api'

const PREF_TO_CATEGORIES = {
  // Taste
  Sweet:   ['Dessert'],
  Savory:  ['Beef', 'Chicken', 'Pork', 'Lamb'],
  Spicy:   [],                              // handled via areas

  // Dish type
  Pasta:   ['Pasta'],
  Soup:    ['Miscellaneous'],
  Salad:   ['Side', 'Vegetarian'],
  Seafood: ['Seafood'],

  // Cuisine — handled via areas
  Italian: [],
  Chinese: [],
  French:  [],
  Mexican: [],
  Indian:  [],
}

const PREF_TO_AREAS = {
  Spicy:   ['Indian', 'Mexican', 'Moroccan', 'Thai'],
  Italian: ['Italian'],
  Chinese: ['Chinese'],
  French:  ['French'],
  Mexican: ['Mexican'],
  Indian:  ['Indian'],
}

// Keywords to exclude per dietary restriction — matched against ingredient names
// When a restriction is active, also pull from these categories to ensure enough results
const RESTRICTION_TO_CATEGORIES = {
  Vegan:       ['Vegan', 'Vegetarian'],
  Vegetarian:  ['Vegetarian', 'Vegan'],
}

const RESTRICTION_INGREDIENTS = {
  Vegan: [
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'bacon', 'ham',
    'salmon', 'tuna', 'shrimp', 'prawn', 'fish', 'anchovy', 'sardine',
    'egg', 'milk', 'cream', 'butter', 'cheese', 'yogurt', 'honey',
    'sausage', 'lard', 'mince', 'gelatin',
  ],
  Vegetarian: [
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'bacon', 'ham',
    'salmon', 'tuna', 'shrimp', 'prawn', 'fish', 'anchovy', 'sardine',
    'sausage', 'lard', 'mince', 'gelatin',
  ],
  'Gluten-free': [
    'flour', 'bread', 'breadcrumb', 'pasta', 'wheat', 'barley', 'rye',
    'soy sauce', 'couscous', 'semolina', 'beer', 'malt',
  ],
  'Nut Allergy': [
    'peanut', 'almond', 'cashew', 'walnut', 'pecan', 'pistachio',
    'hazelnut', 'macadamia', 'pine nut', 'chestnut',
  ],
  'Lactose-free': [
    'milk', 'cream', 'butter', 'cheese', 'yogurt', 'parmesan',
    'mozzarella', 'cheddar', 'brie', 'feta', 'mascarpone', 'ricotta',
    'sour cream',
  ],
  Halal: [
    'pork', 'bacon', 'ham', 'lard', 'prosciutto', 'pancetta',
  ],
}

const DEFAULT_CATEGORIES = ['Chicken', 'Beef', 'Pasta', 'Seafood', 'Dessert']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function transformMeal(m) {
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const name = m[`strIngredient${i}`]?.trim()
    const measure = m[`strMeasure${i}`]?.trim()
    if (name) ingredients.push({ name, measure: measure || '' })
  }
  return {
    id: m.idMeal,
    name: m.strMeal,
    category: m.strCategory,
    area: m.strArea,
    image: m.strMealThumb,
    tags: m.strTags ? m.strTags.split(',').map(t => t.trim()).filter(Boolean) : [],
    ingredients,
    instructions: m.strInstructions,
    recipeUrl: m.strSource || null,
    youtubeUrl: m.strYoutube || null,
  }
}

export function useFoodData() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { preferences, restrictions, dislikes } = useAppStore()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const categories = new Set()
        const areas = new Set()

        if (preferences.length === 0) {
          DEFAULT_CATEGORIES.forEach(c => categories.add(c))
        } else {
          preferences.forEach(pref => {
            ;(PREF_TO_CATEGORIES[pref] || []).forEach(c => categories.add(c))
            ;(PREF_TO_AREAS[pref] || []).forEach(a => areas.add(a))
          })
          if (categories.size + areas.size < 2) {
            DEFAULT_CATEGORIES.slice(0, 2).forEach(c => categories.add(c))
          }
        }

        // Boost fetch pool with restriction-friendly categories
        restrictions.forEach(r => {
          ;(RESTRICTION_TO_CATEGORIES[r] || []).forEach(c => categories.add(c))
        })

        const lists = await Promise.all([
          ...[...categories].map(c => fetchMealsByCategory(c)),
          ...[...areas].map(a => fetchMealsByArea(a)),
        ])

        // Deduplicate
        const seen = new Set()
        const combined = []
        lists.flat().forEach(m => {
          if (!seen.has(m.idMeal)) { seen.add(m.idMeal); combined.push(m) }
        })

        const sample = shuffle(combined).slice(0, 40)
        const details = await Promise.all(sample.map(m => fetchMealDetail(m.idMeal)))
        if (cancelled) return

        const transformed = details
          .filter(Boolean)
          .map(transformMeal)
          .filter(food => {
            const ingredientWords = food.ingredients
              .map(i => i.name.toLowerCase())

            // Word-level match: splits ingredient name into words so "egg"
            // doesn't match "eggplant", but multi-word keywords like "soy sauce" still work
            function matches(ingredientName, keyword) {
              if (keyword.includes(' ')) return ingredientName.includes(keyword)
              return ingredientName.split(/\s+/).some(w => w === keyword)
            }

            // Dislikes — substring match (user knows what they typed)
            if (dislikes.some(d =>
              ingredientWords.some(ing => ing.includes(d.toLowerCase()))
            )) return false

            // Restrictions — word-level match
            for (const restriction of restrictions) {
              const blocked = RESTRICTION_INGREDIENTS[restriction] || []
              if (ingredientWords.some(ing => blocked.some(b => matches(ing, b)))) return false
            }

            return true
          })

        setFoods(transformed)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, []) // intentionally run once on mount

  return { foods, loading, error }
}
