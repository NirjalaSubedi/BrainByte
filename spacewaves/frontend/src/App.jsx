import React, { useState } from 'react';
import Loading from './components/Loading';
import ModeSelection from './components/ModeSelection';
import Game from './components/Game';
import './index.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('loading');

  return (
    <div className="App">
      <div className="starfield-bg"></div>

      {currentScreen === 'loading' && (
        <Loading onFinished={() => setCurrentScreen('menu')} />
      )}

      {currentScreen === 'menu' && (
        <ModeSelection onStart={() => setCurrentScreen('game')} />
      )}

      {currentScreen === 'game' && (
        <Game onGameOver={() => setCurrentScreen('menu')} />
      )}

    </div>
  );
}

export default App;