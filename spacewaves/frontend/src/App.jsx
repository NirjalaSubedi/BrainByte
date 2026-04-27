import React, { useState } from 'react';
import Loading from './components/Loading';
import ModeSelection from './components/ModeSelection';
import Game from './components/Game'; // 1. Mathi Game import garnu
import './index.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('loading');

  return (
    <div className="App">
      <div className="starfield-bg"></div>

      {/* Loading Screen */}
      {currentScreen === 'loading' && (
        <Loading onFinished={() => setCurrentScreen('menu')} />
      )}

      {/* Menu Screen - onStart ma setCurrentScreen('game') halne */}
      {currentScreen === 'menu' && (
        <ModeSelection onStart={() => setCurrentScreen('game')} />
      )}

      {/* Game Screen - Yo bhitra halne */}
      {currentScreen === 'game' && (
        <Game onGameOver={() => setCurrentScreen('menu')} />
      )}

    </div>
  );
}

export default App;