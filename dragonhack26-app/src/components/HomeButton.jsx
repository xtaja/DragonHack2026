import { useLocation, useNavigate } from 'react-router-dom'

export default function HomeButton() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  if (pathname === '/') return null

  return (
    <button className="home-btn" onClick={() => navigate('/')} aria-label="Home">
      🏠
    </button>
  )
}
