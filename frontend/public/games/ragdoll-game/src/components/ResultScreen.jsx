import React from 'react';

/**
 * Result screen shown after game over.
 */
export default function ResultScreen({ data, onRestart, onMenu }) {
  const { playerScore, enemyScore, timer } = data;
  const isWin = playerScore > enemyScore;
  const isDraw = playerScore === enemyScore;

  // Persist stats
  const wins = parseInt(localStorage.getItem('ra_wins') || '0') + (isWin ? 1 : 0);
  const losses = parseInt(localStorage.getItem('ra_losses') || '0') + (!isWin && !isDraw ? 1 : 0);

  // Save on first render
  React.useEffect(() => {
    localStorage.setItem('ra_wins', wins.toString());
    localStorage.setItem('ra_losses', losses.toString());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const titleClass = isWin
    ? 'result-title result-title-win'
    : isDraw
      ? 'result-title result-title-draw'
      : 'result-title result-title-lose';

  const titleText = isWin ? 'VICTORY!' : isDraw ? 'DRAW!' : 'DEFEATED';

  return (
    <div className="result-overlay" id="result-screen">
      <div className="result-card">
        <h1 className={titleClass} id="result-title">{titleText}</h1>

        <div className="result-score-row">
          <div className="result-score-box">
            <span className="result-score-box-label">You</span>
            <span
              className="result-score-box-value"
              style={{ color: 'var(--accent-green)' }}
            >
              {playerScore}
            </span>
          </div>
          <span className="result-divider">—</span>
          <div className="result-score-box">
            <span className="result-score-box-label">Enemy</span>
            <span
              className="result-score-box-value"
              style={{ color: 'var(--accent-red)' }}
            >
              {enemyScore}
            </span>
          </div>
        </div>

        <div className="result-stats">
          <div className="result-stat">
            <div className="result-stat-label">Time</div>
            <div className="result-stat-value" style={{ color: 'var(--text-primary)' }}>
              {timer}
            </div>
          </div>
          <div className="result-stat">
            <div className="result-stat-label" style={{ color: 'var(--accent-green)' }}>Wins</div>
            <div className="result-stat-value" style={{ color: 'var(--accent-green)' }}>
              {wins}
            </div>
          </div>
          <div className="result-stat">
            <div className="result-stat-label" style={{ color: 'var(--accent-red)' }}>Losses</div>
            <div className="result-stat-value" style={{ color: 'var(--accent-red)' }}>
              {losses}
            </div>
          </div>
        </div>

        <button
          className="result-btn"
          id="play-again-button"
          onClick={onRestart}
        >
          ▶ &nbsp;PLAY AGAIN
        </button>

        <button
          className="modal-close-btn"
          id="back-to-menu-button"
          onClick={onMenu}
          style={{ marginTop: 10 }}
        >
          BACK TO MENU
        </button>
      </div>
    </div>
  );
}
