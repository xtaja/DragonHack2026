import { useState, useEffect } from 'react'
import useAppStore from '../store/useAppStore'
import { fetchMealsByCategory, fetchMealsByArea, fetchMealDetail } from '../lib/api'

const PREF_TO_CATEGORIES = {
  Sweet:     ['Dessert'],
  Savory:    ['Beef', 'Chicken', 'Pork', 'Lamb'],
  Breakfast: ['Breakfast'],
  Snack:     ['Starter', 'Side'],
  Healthy:   ['Vegetarian', 'Vegan'],
  Seafood:   ['Seafood'],
  Pasta:     ['Pasta'],
}

const PREF_TO_AREAS = {
  Asian: ['Japanese', 'Chinese', 'Thai', 'Indian', 'Malaysian'],
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
  const { preferences, dislikes } = useAppStore()

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

        const sample = shuffle(combined).slice(0, 20)
        const details = await Promise.all(sample.map(m => fetchMealDetail(m.idMeal)))
        if (cancelled) return

        const transformed = details
          .filter(Boolean)
          .map(transformMeal)
          .filter(food => {
            if (!dislikes.length) return true
            const ingredientStr = food.ingredients.map(i => i.name.toLowerCase()).join(' ')
            return !dislikes.some(d => ingredientStr.includes(d.toLowerCase()))
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
