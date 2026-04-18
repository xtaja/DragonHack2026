const BASE = 'https://www.themealdb.com/api/json/v1/1'

export async function fetchMealsByCategory(category) {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`)
  const data = await res.json()
  return data.meals || []
}

export async function fetchMealsByArea(area) {
  const res = await fetch(`${BASE}/filter.php?a=${encodeURIComponent(area)}`)
  const data = await res.json()
  return data.meals || []
}

export async function fetchMealDetail(id) {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`)
  const data = await res.json()
  return data.meals?.[0] ?? null
}
