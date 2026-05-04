import React, { useEffect, useState } from 'react';

const Leaderboard = ({ onBack }) => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Backend bata Top 10 data tanne logic
        const fetchRankings = async () => {
            try {
                const response = await fetch('http://localhost:3000/leaderboard');
                const data = await response.json();
                setRankings(data); // Database bata aayeko list state ma save garne
            } catch (err) {
                console.error("Leaderboard fetch garna sakiyena:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, []);

    return (
        <div className="leaderboard-overlay">
            <div className="leaderboard-box">
                <h1 className="leaderboard-title">GLOBAL RANKING</h1>

                <div className="rankings-list">
                    <div className="list-header">
                        <span>RANK</span>
                        <span>PILOT</span>
                        <span>SCORE</span>
                    </div>

                    {loading ? (
                        <p className="status-text">LOADING DATA...</p>
                    ) : rankings.length > 0 ? (
                        rankings.map((player, index) => (
                            <div className="list-item" key={index}>
                                <span>#{index + 1}</span>
                                <span>{player.username}</span>
                                <span>{player.high_score}</span>
                            </div>
                        ))
                    ) : (
                        <p className="status-text">NO RECORDS FOUND</p>
                    )}
                </div>

                <button className="return-btn" onClick={onBack}>
                    RETURN TO BASE
                </button>
            </div>

            <style>{`
                .leaderboard-overlay {
                    position: fixed; inset: 0; background: rgba(10, 5, 20, 0.95);
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Orbitron', sans-serif; z-index: 2000;
                }
                .leaderboard-box {
                    width: 600px; padding: 40px; border: 4px solid #00ffff;
                    background: #1a0533; box-shadow: 0 0 20px #00ffff; text-align: center;
                }
                .leaderboard-title { color: #00ffff; font-size: 2.5rem; margin-bottom: 30px; letter-spacing: 3px; }
                
                .rankings-list { margin-bottom: 30px; max-height: 400px; overflow-y: auto; }
                
                .list-header, .list-item {
                    display: grid; grid-template-columns: 1fr 2fr 1fr;
                    padding: 12px; border-bottom: 1px solid rgba(0, 255, 255, 0.2);
                    color: white; font-weight: bold;
                }
                .list-header { color: #ff00ff; border-bottom: 2px solid #ff00ff; }
                .list-item:hover { background: rgba(255, 0, 255, 0.1); }
                
                .status-text { color: #888; margin-top: 20px; }
                
                .return-btn {
                    width: 100%; padding: 15px; background: none;
                    border: 2px solid #ff00ff; color: #ff00ff;
                    font-weight: bold; cursor: pointer; font-family: 'Orbitron';
                    transition: 0.3s;
                }
                .return-btn:hover { background: #ff00ff; color: white; }
            `}</style>
        </div>
    );
};

export default Leaderboard;