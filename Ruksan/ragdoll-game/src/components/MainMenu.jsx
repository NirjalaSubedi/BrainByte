import React, { useState, useMemo } from 'react';
import HowToPlay from './HowToPlay.jsx';

/**
 * Premium Main Menu screen.
 */
export default function MainMenu({ onPlay }) {
  const [showHelp, setShowHelp] = useState(false);

  // Generate floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 3,
      delay: `${Math.random() * 4}s`,
      duration: `${3 + Math.random() * 4}s`,
      opacity: 0.05 + Math.random() * 0.15,
    }));
  }, []);

  // Decorative arrows positions
  const decoArrows = useMemo(() => [
    { left: '8%', top: '15%', delay: '0s', size: 50 },
    { right: '12%', top: '25%', delay: '1.5s', size: 38 },
    { left: '15%', bottom: '20%', delay: '3s', size: 44 },
    { right: '8%', bottom: '30%', delay: '0.8s', size: 36 },
    { left: '45%', top: '8%', delay: '2s', size: 32 },
  ], []);

  return (
    <div className="menu-screen" id="main-menu">
      {/* Background gradients */}
      <div className="menu-bg" />

      {/* Floating particles */}
      <div className="menu-particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="menu-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Decorative arrows */}
      {decoArrows.map((a, i) => (
        <div
          key={i}
          className="deco-arrow"
          style={{
            ...a,
            fontSize: a.size,
            animationDelay: a.delay,
          }}
        >
          🏹
        </div>
      ))}

      {/* Content */}
      <div className="menu-content">
        <h1 className="menu-title" id="game-title">
          RAGDOLL<br />ARCHERS
        </h1>
        <p className="menu-subtitle">Stickman Physics Archery</p>

        <button
          className="menu-btn menu-btn-primary"
          id="play-button"
          onClick={onPlay}
        >
          ▶ &nbsp;PLAY GAME
        </button>

        <button
          className="menu-btn menu-btn-secondary"
          id="how-to-play-button"
          onClick={() => setShowHelp(true)}
        >
          ?&nbsp; HOW TO PLAY
        </button>

        {/* Upgrade panel (cosmetic for now) */}
        <div className="upgrade-panel">
          {[
            { icon: '🛡️', name: 'ARMOR', level: '+0', cost: '💀 10' },
            { icon: '❤️', name: 'HEALTH', level: '+0', cost: '💀 10' },
            { icon: '🏹', name: 'POWER', level: '+0', cost: '💀 10' },
            { icon: '⚡', name: 'STAMINA', level: '+0', cost: '💀 10' },
          ].map((u, i) => (
            <div className="upgrade-row" key={i}>
              <span className="upgrade-icon">{u.icon}</span>
              <div className="upgrade-info">
                <div className="upgrade-name">{u.name}</div>
                <div className="upgrade-level">{u.level}</div>
              </div>
              <span className="upgrade-cost">{u.cost}</span>
            </div>
          ))}
        </div>
      </div>

      <span className="menu-version">v2.0 — BrainByte</span>
      <span className="menu-hint">Drag & release to shoot • Aim for the head!</span>

      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
    </div>
  );
}
