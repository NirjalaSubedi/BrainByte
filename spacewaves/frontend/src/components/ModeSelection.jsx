import React from 'react';

// 1. GameCard ma onStart prop thapne
const GameCard = ({ title, desc, icon, subBtn, btnText, onStart }) => (
    <div className="mode-card">
        <h3 className="card-title">{title}</h3>
        <div className="card-icon">
            <i className={icon}></i>
        </div>
        <p className="card-desc">{desc}</p>
        {subBtn && <button className="sub-button">{subBtn}</button>}
        {/* 2. Button thichda onStart run hune banaune */}
        <button className="start-button" onClick={onStart}>
            {btnText} <i className="fa-solid fa-play" style={{ marginLeft: '10px' }}></i>
        </button>
    </div>
);

// 3. ModeSelection ko bracket bhitra { onStart } thapne
const ModeSelection = ({ onStart }) => {
    return (
        <div className="menu-container">
            <div className="menu-header">
                <div className="header-box"><i className="fa-solid fa-cart-shopping"></i></div>
                <h2 className="header-title">SELECT A GAME MODE</h2>
                <div className="header-box">
                    <i className="fa-solid fa-gem" style={{ color: '#00ffff' }}></i> 168
                    <span style={{ marginLeft: '10px' }}><i className="fa-solid fa-plus"></i></span>
                </div>
            </div>

            <div className="modes-wrapper">
                {/* 4. Sabai GameCard ma onStart={onStart} thapne */}
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
                .menu-container { background: #8b2fc9; height: 100vh; padding: 40px; }
                .menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
                .header-box { background: rgba(0,0,0,0.3); border: 2px solid white; padding: 10px 20px; font-weight: bold; }
                .modes-wrapper { display: flex; gap: 30px; justify-content: center; }
                .mode-card { 
                    background: #c175ff; border: 4px solid #fff; padding: 25px; 
                    width: 280px; color: #2d0a4e; text-align: center;
                    display: flex; flex-direction: column; transition: 0.3s;
                }
                .mode-card:hover { transform: translateY(-10px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
                .card-icon { font-size: 60px; margin: 25px 0; }
                .card-desc { font-size: 15px; margin-bottom: 25px; min-height: 45px; font-weight: bold; }
                .sub-button { background: #a356e6; border: 2px solid #2d0a4e; color: white; padding: 10px; margin-bottom: 10px; cursor: pointer; font-weight: bold; }
                .start-button { background: white; border: none; padding: 15px; font-weight: bold; cursor: pointer; font-size: 1.1rem; }
            `}</style>
        </div>
    );
};

export default ModeSelection;