import React from 'react';

/**
 * How To Play modal overlay.
 */
export default function HowToPlay({ onClose }) {
  return (
    <div className="modal-overlay" id="how-to-play-modal" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🏹 How To Play</h2>

        <div className="modal-section">
          <div className="modal-section-title">CONTROLS</div>
          <div className="modal-item">
            <span className="modal-item-icon">🎯</span>
            <span>
              <span className="modal-item-highlight">Drag backward</span> from your archer to aim — release to shoot
            </span>
          </div>
          <div className="modal-item">
            <span className="modal-item-icon">💪</span>
            <span>
              <span className="modal-item-highlight">Longer drag = more power</span> — watch your stamina!
            </span>
          </div>
          <div className="modal-item">
            <span className="modal-item-icon">🦘</span>
            <span>
              Press <span className="modal-item-highlight">JUMP</span> button to dodge enemy arrows
            </span>
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">DAMAGE ZONES</div>
          <div className="modal-item">
            <span className="modal-item-icon">💀</span>
            <span>
              <span className="modal-item-highlight">HEAD SHOT</span> = Instant Kill (if no helmet)
            </span>
          </div>
          <div className="modal-item">
            <span className="modal-item-icon">🪖</span>
            <span>
              <span className="modal-item-highlight">HELMET HIT</span> = Knocks helmet off (0 damage)
            </span>
          </div>
          <div className="modal-item">
            <span className="modal-item-icon">🫁</span>
            <span>
              <span className="modal-item-highlight">BODY HIT</span> = 35 HP damage + knockback
            </span>
          </div>
          <div className="modal-item">
            <span className="modal-item-icon">💪</span>
            <span>
              <span className="modal-item-highlight">ARM HIT</span> = 20 damage + reduces accuracy
            </span>
          </div>
          <div className="modal-item">
            <span className="modal-item-icon">🦵</span>
            <span>
              <span className="modal-item-highlight">LEG HIT</span> = 25 damage + causes limp
            </span>
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-title">FRUIT BONUSES</div>
          <div className="modal-item">
            <span className="modal-item-icon">🍎</span>
            <span>
              <span style={{ color: '#ff4444' }}>Red Apple</span> = +25 HP
            </span>
          </div>
          <div className="modal-item">
            <span className="modal-item-icon">🍏</span>
            <span>
              <span style={{ color: '#44ff44' }}>Green Apple</span> = +35 Stamina
            </span>
          </div>
          <div className="modal-item">
            <span className="modal-item-icon">🍊</span>
            <span>
              <span style={{ color: '#ebd724ff' }}>Golden Apple</span> = +1 Extra Life!
            </span>
          </div>
          <div className="modal-item">
            <span className="modal-item-icon">💣</span>
            <span>
              <span style={{ color: '#ad6e26ff' }}>Bomb</span> = Next arrow is explosive!
            </span>
          </div>
        </div>

        <button className="modal-close-btn" onClick={onClose}>
          GOT IT
        </button>
      </div>
    </div>
  );
}
