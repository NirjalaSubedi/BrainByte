import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Game from './pages/Game';

function App() {
  return (
    <Router>
      <div className="bg-[#0a0a1a] min-h-screen">
        <Routes>
          {/* Landing Page (Home) */}
          
          
          {/* Game Logic Page */}
          <Route path="/play" element={<Game />} />

          {/* Pachi hami GameOver page pani yaha thapchau */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;