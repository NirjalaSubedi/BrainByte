import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Game from './pages/Game';
import Home from './pages/Home';
import GameOver from './pages/GameOver';

function App() {
  return (
    <Router>
      <div className="bg-[#0a0a1a] min-h-screen">
        <Routes>
          {/* Landing Page (Home) */}
          <Route path="/" element={<Home/>}/>
          
          
          {/* Game Logic Page */}
          <Route path="/play" element={<Game />} />

          {/* Pachi hami GameOver page pani yaha thapchau */}

          <Route path="/game-over" element={<GameOver />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;