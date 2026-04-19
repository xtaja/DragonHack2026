import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SetupPage from './pages/SetupPage'
import ModePage from './pages/ModePage'
import SwipePage from './pages/SwipePage'
import ResultPage from './pages/ResultPage'
import MultiplayerPage from './pages/MultiplayerPage'
import CreateRoomPage from './pages/CreateRoomPage'
import JoinRoomPage from './pages/JoinRoomPage'
import MultiSwipePage from './pages/MultiSwipePage'
import HomeButton from './components/HomeButton'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <HomeButton />
      <Routes>
        <Route path="/" element={<SetupPage />} />
        <Route path="/mode" element={<ModePage />} />
        <Route path="/swipe" element={<SwipePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/multiplayer" element={<MultiplayerPage />} />
        <Route path="/room/create" element={<CreateRoomPage />} />
        <Route path="/room/join" element={<JoinRoomPage />} />
        <Route path="/multi-swipe" element={<MultiSwipePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
