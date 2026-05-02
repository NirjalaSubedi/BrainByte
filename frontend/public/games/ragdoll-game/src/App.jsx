import React, { useState, useCallback } from 'react';
import MainMenu from './components/MainMenu.jsx';
import GameView from './components/GameView.jsx';
import ResultScreen from './components/ResultScreen.jsx';

/**
 * App root — manages screen state:
 *   'menu'   → Main menu
 *   'game'   → Active Phaser game + HUD overlay
 *   'result' → Game over / win screen
 */
export default function App() {
  const [screen, setScreen] = useState('menu');
  const [resultData, setResultData] = useState(null);

  const handlePlay = useCallback(() => {
    setScreen('game');
  }, []);

  const handleGameOver = useCallback((data) => {
    setResultData(data);
    setScreen('result');
  }, []);

  const handleRestart = useCallback(() => {
    setResultData(null);
    setScreen('game');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setResultData(null);
    setScreen('menu');
  }, []);

  return (
    <>
      {screen === 'menu' && (
        <MainMenu onPlay={handlePlay} />
      )}
      {screen === 'game' && (
        <GameView onGameOver={handleGameOver} />
      )}
      {screen === 'result' && resultData && (
        <ResultScreen
          data={resultData}
          onRestart={handleRestart}
          onMenu={handleBackToMenu}
        />
      )}
    </>
  );
}
