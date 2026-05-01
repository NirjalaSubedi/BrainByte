import React from 'react';

const GameCard = ({ title, desc, icon, subBtn, btnText, onStart }) => (
    <div className="mode-card">
        <h3 className="card-title">{title}</h3>
        <div className="card-icon">
            <i className={icon}></i>
        </div>
        <p className="card-desc">{desc}</p>
        {subBtn && <button className="sub-button">{subBtn}</button>}
        <button className="start-button" onClick={onStart}>
            {btnText} <i className="fa-solid fa-play" style={{ marginLeft: '10px' }}></i>
        </button>
    </div>
);

const ModeSelection = ({ onStart, user, onShowLeaderboard, onLogout }) => {
    return (
        <div className="menu-container">
            <div className="menu-header">
                <button
                    className="header-box logout-special"
                    onClick={(e) => {
                        e.preventDefault();
                        onLogout();
                    }}
                >
                    <i className="fa-solid fa-right-from-bracket"></i> LOGOUT
                </button>

                <h2 className="header-title">WELCOME, {user?.username || 'PILOT'}</h2>

                {/* LEADERBOARD */}
                <button className="header-box" onClick={onShowLeaderboard}>
                    <i className="fa-solid fa-trophy" style={{ color: '#ffd700' }}></i> TOP 10
                </button>
            </div>

            <div className="modes-wrapper">
                <GameCard
                    title="CLASSIC"
                    icon="fa-solid fa-flag-checkered"
                    desc="reach the finish to complete levels"
                    subBtn="SELECT LEVEL"
                    btnText="START"
                    onStart={onStart}
                />
                <GameCard
                    title="ENDLESS"
                    icon="fa-solid fa-rocket"
                    desc="go as far as possible and set a highscore"
                    btnText="START"
                    onStart={onStart}
                />
                <GameCard
                    title="RACE"
                    icon="fa-solid fa-stopwatch"
                    desc="reach the finish before others"
                    subBtn="< EASY >"
                    btnText="START"
                    onStart={onStart}
                />
            </div>

            <style>{`
                .menu-container { background: #8b2fc9; height: 100vh; padding: 40px; font-family: 'Orbitron', sans-serif; position: relative; z-index: 1; }
                .menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
                
                .header-box { 
                    background: rgba(0,0,0,0.3); 
                    border: 2px solid white; 
                    padding: 10px 20px; 
                    font-weight: bold; 
                    color: white;
                    transition: 0.2s;
                    cursor: pointer;
                    font-family: 'Orbitron';
                    z-index: 10; /* Mathi rakhna ko lagi */
                }
                
                .header-box:hover { background: white; color: #8b2fc9; }
                
                .logout-special:hover {
                    border-color: #ff4444;
                    color: #ff4444;
                }

                .header-title { color: white; text-transform: uppercase; letter-spacing: 2px; font-size: 1.5rem; text-shadow: 2px 2px 10px rgba(0,0,0,0.5); }
                .modes-wrapper { display: flex; gap: 30px; justify-content: center; }
                
                .mode-card { 
                    background: #c175ff; border: 4px solid #fff; padding: 25px; 
                    width: 280px; color: #2d0a4e; text-align: center;
                    display: flex; flex-direction: column; transition: 0.3s;
                }
                
                .mode-card:hover { transform: translateY(-10px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
                .card-icon { font-size: 60px; margin: 25px 0; }
                .card-desc { font-size: 15px; margin-bottom: 25px; min-height: 45px; font-weight: bold; }
                .sub-button { background: #a356e6; border: 2px solid #2d0a4e; color: white; padding: 10px; margin-bottom: 10px; cursor: pointer; font-weight: bold; font-family: 'Orbitron'; }
                .start-button { background: white; border: none; padding: 15px; font-weight: bold; cursor: pointer; font-size: 1.1rem; font-family: 'Orbitron'; transition: 0.2s; }
                .start-button:hover { background: #2d0a4e; color: white; }
            `}</style>
        </div>
    );
};

export default ModeSelection;