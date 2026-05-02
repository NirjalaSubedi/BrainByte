import React, { useEffect, useRef, useState, useCallback } from 'react';
import HUD from './HUD.jsx';
import PauseOverlay from './PauseOverlay.jsx';
import { createGame, destroyGame } from '../game/PhaserGame.js';

/**
 * GameView — mounts Phaser into #game-container and renders React HUD on top.
 */
export default function GameView({ onGameOver }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  const [hp, setHp] = useState(100);
  const [maxHp] = useState(100);
  const [st, setSt] = useState(100);
  const [maxSt] = useState(100);
  const [playerScore, setPlayerScore] = useState(0);
  const [enemyScore, setEnemyScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState('00:00.000');
  const [isPaused, setIsPaused] = useState(false);

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    if (!containerRef.current) return;

    const eventBus = {
      onHpChange: (val) => setHp(val),
      onStChange: (val) => setSt(val),
      onPlayerScore: (val) => setPlayerScore(val),
      onEnemyScore: (val) => setEnemyScore(val),
      onRoundChange: (val) => setRound(val),
      onTimerUpdate: (val) => setTimer(val),
      onPause: (val) => setIsPaused(val),
      onGameOver: (data) => onGameOverRef.current(data),
    };

    gameRef.current = createGame(containerRef.current, eventBus);

    return () => {
      destroyGame(gameRef.current);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="game-wrapper">
      <div id="game-container" ref={containerRef} />

      <HUD
        hp={hp}
        maxHp={maxHp}
        st={st}
        maxSt={maxSt}
        playerScore={playerScore}
        enemyScore={enemyScore}
        round={round}
        timer={timer}
      />

      {isPaused && <PauseOverlay />}
    </div>
  );
}
