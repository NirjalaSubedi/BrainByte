import React from 'react';

/**
 * Pause overlay shown when the mouse leaves the game canvas.
 */
export default function PauseOverlay() {
  return (
    <div className="pause-overlay" id="pause-overlay">
      <div className="pause-title">PAUSED</div>
      <p className="pause-hint">Move mouse back to resume</p>
    </div>
  );
}
