import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Game from './pages/Game'
import LobbyList from './pages/LobbyList'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobbylist" element={<LobbyList />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </>
  )
}

export default App
