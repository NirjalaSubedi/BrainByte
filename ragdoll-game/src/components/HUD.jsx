import React from 'react';

/**
 * Premium HUD overlay rendered over the Phaser canvas.
 */
export default function HUD({ hp, maxHp, st, maxSt, playerScore, enemyScore, round, timer }) {
  const hpPercent = Math.max(0, (hp / maxHp) * 100);
  const stPercent = Math.max(0, (st / maxSt) * 100);

  return (
    <div className="hud-overlay" id="game-hud">
      <div className="hud-top">
        {/* Left side: Score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="hud-score-card" id="score-card">
            <div>
              <div className="hud-score-label">You</div>
              <div className="hud-score-value">{playerScore}</div>
            </div>
            <span className="hud-vs">VS</span>
            <div>
              <div className="hud-score-label">Enemy</div>
              <div className="hud-score-value hud-enemy-score">{enemyScore}</div>
            </div>
          </div>

          <div className="hud-round-badge" id="round-badge">
            ROUND <span className="hud-round-number">{round}</span>
          </div>
        </div>

        {/* Right side: Bars + Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div className="hud-timer" id="game-timer">{timer}</div>

          <div className="hud-bars">
            {/* HP Bar */}
            <div className="hud-bar-container" id="hp-bar-container">
              <span className="hud-bar-icon">❤️</span>
              <div className="hud-bar-track">
                <div
                  className="hud-bar-fill hud-bar-fill-hp"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="hud-bar-text">{Math.floor(hp)}</span>
            </div>

            {/* Stamina Bar */}
            <div className="hud-bar-container" id="stamina-bar-container">
              <span className="hud-bar-icon">⚡</span>
              <div className="hud-bar-track">
                <div
                  className="hud-bar-fill hud-bar-fill-st"
                  style={{ width: `${stPercent}%` }}
                />
              </div>
              <span className="hud-bar-text">{Math.floor(st)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
