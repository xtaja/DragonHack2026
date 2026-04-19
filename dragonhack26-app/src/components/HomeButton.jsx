import { useLocation, useNavigate } from 'react-router-dom'
import logo1 from '../assets/logo1.svg'

export default function HomeButton() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  if (pathname === '/') return null

  return (
    <button type="button" className="home-btn" onClick={() => navigate('/')} aria-label="Home">
      <img src={logo1} alt="" className="home-btn__img" width={173} height={113} />
    </button>
  )
}
