import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bestScore, setBestScore] = React.useState(0);
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const hasSavedRef = React.useRef(false);
  
  // Game.jsx बाट पठाएको score र level प्राप्त गर्ने
  const score = location.state?.score || 0;
  const level = location.state?.level || 1;
  const username = localStorage.getItem('brainbyte_user');
  
  console.log('GameOver received - score:', score, 'level:', level, 'username:', username);

  // Save score exactly once, then refresh leaderboard + player stats
  const fetchBoardData = React.useCallback(async () => {
    setLoading(true);
    try {
      const boardRes = await fetch('http://localhost:5000/scores/fruit-slicer/top?limit=8');
      if (!boardRes.ok) {
        const txt = await boardRes.text().catch(() => 'Error');
        throw new Error(txt || 'Failed to load leaderboard');
      }
      const boardData = await boardRes.json();
      setLeaderboard(Array.isArray(boardData) ? boardData : []);

      if (username) {
        const userRes = await fetch(`http://localhost:5000/scores/fruit-slicer/user/${encodeURIComponent(username)}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setBestScore(Number(userData.bestScore) || 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch score data:', err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  React.useEffect(() => {
    let mounted = true;

    const saveAndLoad = async () => {
      if (username && score > 0 && !hasSavedRef.current) {
        hasSavedRef.current = true;
        try {
          const scoreData = { username, game_id: 'fruit-slicer', score, level };
          console.log('Sending score data to backend:', scoreData);
          await fetch('http://localhost:5000/add-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scoreData)
          });
        } catch (err) {
          console.warn('Score save error', err);
        }
      }

      if (mounted) await fetchBoardData();
    };

    saveAndLoad();
    return () => { mounted = false; };
  }, [score, level, username, fetchBoardData]);

  return (
    <div className="relative w-full h-screen bg-[#060614] flex flex-col items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <h1 className="text-8xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          GAME OVER
        </h1>
        
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl">🌱</span>
          <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm">Level {level}</span>
        </div>

        <div className="bg-[#11111a] border border-white/5 p-10 rounded-[40px] w-85 text-center mb-10 shadow-2xl">
          <p className="text-gray-500 uppercase text-xs font-bold mb-1">Your Score</p>
          <h2 className="text-7xl font-extrabold text-white mb-4">{score}</h2>
          <div className="h-[1px] bg-white/5 w-full mb-4"></div>
          <p className="text-gray-500 uppercase text-xs font-bold mb-1">Best</p>
          <h2 className="text-2xl font-bold text-yellow-400">{loading ? '...' : bestScore}</h2>
        </div>

        <div className="bg-[#11111a] border border-white/5 p-6 rounded-[30px] w-full max-w-xl mb-10 shadow-2xl">
          <p className="text-gray-500 uppercase text-xs font-bold mb-4">Leaderboard</p>
          {loading ? (
            <p className="text-sm text-gray-400">Loading leaderboard...</p>
          ) : leaderboard.length === 0 ? (
            <div>
              <p className="text-sm text-gray-400">No scores available yet.</p>
              <button onClick={fetchBoardData} className="mt-2 px-3 py-1 bg-cyan-500 text-black rounded">Retry</button>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((row, index) => (
                <div key={`${row.username}-${index}`} className="flex justify-between items-center bg-black/25 rounded-xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-semibold">#{index + 1} {row.username}</span>
                    <span className="text-xs text-purple-300 font-bold">Lvl {row.level || 1}</span>
                  </div>
                  <span className="text-sm text-cyan-300 font-bold">{Number(row.best_score || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <button 
            onClick={() => navigate('/')}
            className="bg-[#1a1a24] text-white px-10 py-4 rounded-full flex items-center gap-2 font-bold hover:bg-[#252533] border border-white/5 transition-all"
          >
            🏠 Home
          </button>
          <button 
            onClick={() => navigate('/play')}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-4 rounded-full flex items-center gap-2 font-bold hover:scale-105 transition-all shadow-lg shadow-orange-500/20"
          >
            🔄 Play Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameOver;