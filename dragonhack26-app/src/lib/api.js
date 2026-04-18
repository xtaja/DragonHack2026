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

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      () => reject(new Error('Location permission denied')),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    )
  })
}

const CUISINE_MAP = {
  Italian:    'italian',
  Chinese:    'chinese',
  French:     'french',
  Mexican:    'mexican',
  Indian:     'indian',
  Japanese:   'japanese',
  Thai:       'thai',
  Greek:      'greek',
  Spanish:    'spanish',
  American:   'american',
  British:    'british',
  Moroccan:   'moroccan',
  Turkish:    'turkish',
  Vietnamese: 'vietnamese',
  Malaysian:  'malaysian',
  Seafood:    'seafood',
  Vegetarian: 'vegetarian',
  Vegan:      'vegan',
  Pasta:      'italian',
  Breakfast:  'breakfast',
}

export function getMapsSearchUrl(lat, lng, query) {
  const cuisine = CUISINE_MAP[query] || 'restaurant'
  // Center on user location, search for cuisine, place a pin at user coords
  const search = encodeURIComponent(cuisine + ' restaurant')
  return `https://www.google.com/maps/search/${search}/@${lat},${lng},15z?hl=en&entry=ttu`
}
