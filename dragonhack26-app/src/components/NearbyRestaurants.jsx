import { useState } from 'react'
import { getUserLocation, getMapsSearchUrl } from '../lib/api'

export default function NearbyRestaurants({ foodName, category }) {
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [mapsUrl, setMapsUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleFind() {
    setState('loading')
    try {
      const { lat, lng } = await getUserLocation()
      setMapsUrl(getMapsSearchUrl(lat, lng, category || foodName))
      setState('done')
    } catch (e) {
      setErrorMsg(e.message)
      setState('error')
    }
  }

  if (state === 'idle') {
    return (
      <button className="nearby-btn" onClick={handleFind}>
        📍 Find nearby restaurants
      </button>
    )
  }

  if (state === 'loading') {
    return <p className="nearby-loading">Getting your location…</p>
  }

  if (state === 'error') {
    return <p className="setup-error">{errorMsg}</p>
  }

  return (
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="result-link-btn result-link-btn--maps">
      📍 Search nearby restaurants on Google Maps
    </a>
  )
}
