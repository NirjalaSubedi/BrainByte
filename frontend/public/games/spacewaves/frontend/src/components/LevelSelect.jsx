import React from 'react';

const LevelSelect = ({ selectedLevel, onSelectLevel, onBack, onStart }) => {
    const levels = Array.from({ length: 15 }, (_, index) => index + 1);

    return (
        <div className="level-select-screen">
            <div className="level-select-panel">
                <div className="level-select-header">
                    <button className="back-button" onClick={onBack} type="button">
                        <i className="fa-solid fa-arrow-left"></i> BACK
                    </button>
                    <h2>SELECT LEVEL</h2>
                    <div className="level-badge">STARTING AT {selectedLevel}</div>
                </div>

                <div className="level-grid">
                    {levels.map((level) => (
                        <button
                            key={level}
                            type="button"
                            className={`level-box ${selectedLevel === level ? 'active' : ''}`}
                            onClick={() => onSelectLevel(level)}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                <div className="level-actions">
                    <button className="start-level-button" type="button" onClick={onStart}>
                        START FROM LEVEL {selectedLevel}
                    </button>
                </div>
            </div>

            <style>{`
                .level-select-screen {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(180deg, #8b2fc9 0%, #5f1f95 100%);
                    font-family: 'Orbitron', sans-serif;
                    padding: 30px;
                    color: white;
                }
                .level-select-panel {
                    width: min(980px, 100%);
                    background: rgba(0, 0, 0, 0.18);
                    border: 4px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
                    padding: 26px;
                    backdrop-filter: blur(6px);
                }
                .level-select-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 22px;
                    flex-wrap: wrap;
                }
                .level-select-header h2 {
                    margin: 0;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    font-size: 2rem;
                }
                .back-button {
                    background: rgba(0, 0, 0, 0.28);
                    color: white;
                    border: 2px solid white;
                    padding: 12px 18px;
                    font-family: 'Orbitron';
                    font-weight: 900;
                    cursor: pointer;
                }
                .back-button:hover {
                    background: white;
                    color: #5f1f95;
                }
                .level-badge {
                    border: 2px solid white;
                    padding: 12px 18px;
                    font-weight: 900;
                    letter-spacing: 1px;
                    background: rgba(255, 255, 255, 0.12);
                }
                .level-grid {
                    display: grid;
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                    gap: 14px;
                }
                .level-box {
                    min-height: 72px;
                    border: 2px solid white;
                    background: rgba(0, 0, 0, 0.18);
                    color: white;
                    font-family: 'Orbitron';
                    font-weight: 900;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
                }
                .level-box:hover {
                    transform: translateY(-2px);
                    background: rgba(255, 255, 255, 0.2);
                }
                .level-box.active {
                    background: white;
                    color: #5f1f95;
                }
                .level-actions {
                    display: flex;
                    justify-content: center;
                    margin-top: 22px;
                }
                .start-level-button {
                    background: white;
                    color: #5f1f95;
                    border: none;
                    padding: 16px 28px;
                    font-family: 'Orbitron';
                    font-weight: 900;
                    cursor: pointer;
                    letter-spacing: 1px;
                }
                .start-level-button:hover {
                    background: #2d0a4e;
                    color: white;
                }
                @media (max-width: 760px) {
                    .level-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                    .level-select-header { justify-content: center; }
                }
                @media (max-width: 480px) {
                    .level-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .level-select-header h2 { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default LevelSelect;
