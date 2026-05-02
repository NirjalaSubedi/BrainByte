import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';

// Assets Imports
import appleImg from '../assets/Apple.png';
import bananaImg from '../assets/banana.png';
import grapesBlackImg from '../assets/grapes-black.png';
import grapesImg from '../assets/grapes.png';
import strawberryImg from '../assets/strawberry.png';
import mangoImg from '../assets/mango.png';
import pineappleImg from '../assets/pineapple.png';
import watermelonImg from '../assets/watermelon.png';
import kiwiImg from '../assets/kiwi.png';
import cherryImg from '../assets/cheery.png';

const Home = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [boardError, setBoardError] = useState('');

  const getLevel = (score) => {
    const points = Number(score || 0);
    if (points >= 2000) return 5;
    if (points >= 1500) return 4;
    if (points >= 1000) return 3;
    if (points >= 500) return 2;
    return 1;
  };

  const loadLeaderboard = async () => {
    setLoadingBoard(true);
    setBoardError('');
    try {
      const response = await fetch('http://localhost:5000/scores/fruit-slicer/top?limit=3');
      if (!response.ok) {
        const err = await response.text().catch(() => 'Failed');
        throw new Error(err || 'Failed to load leaderboard');
      }
      const data = await response.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Leaderboard fetch failed:', error);
      setLeaderboard([]);
      setBoardError(error.message || 'Failed to load leaderboard');
    } finally {
      setLoadingBoard(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) loadLeaderboard();
    return () => { mounted = false; };
  }, []);

  const topScore = useMemo(() => {
    if (!leaderboard.length) return 0;
    return Number(leaderboard[0]?.best_score) || 0;
  }, [leaderboard]);

  const floatingFruits = [
    { img: appleImg, top: '10%', left: '8%', delay: 0 },
    { img: grapesBlackImg, top: '40%', left: '12%', delay: 0.5 },
    { img: cherryImg, top: '25%', left: '25%', delay: 1.2 },
    { img: pineappleImg, top: '75%', left: '10%', delay: 0.8 },
    { img: strawberryImg, top: '65%', left: '30%', delay: 0.8 },
    { img: bananaImg, top: '20%', right: '8%', delay: 1 },
    { img: mangoImg, top: '45%', right: '20%', delay: 1.2 },
    { img: kiwiImg, top: '12%', right: '25%', delay: 1.2 },
    { img: watermelonImg, top: '70%', right: '12%', delay: 1.2 },
    { img: grapesImg, top: '80%', right: '25%', delay: 1.5 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">
      
      {/* 1. Background Floating Fruits */}
      {floatingFruits.map((f, i) => (
        <motion.img
          key={i}
          src={f.img}
          initial={{ y: 0, rotate: 0 }}
          animate={{ y: [0, -25, 0], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: f.delay, ease: "easeInOut" }}
          className="absolute w-12 h-12 md:w-16 md:h-16 opacity-30 blur-[0.5px] object-contain"
          style={{ 
            top: f.top, 
            left: f.left ? f.left : 'auto', 
            right: f.right ? f.right : 'auto' 
          }}
        />
      ))}

      {/* 2. Main Center Content */}
      <div className="z-10 text-center flex flex-col items-center">
        
        {/* Title with Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative mb-10"
        >
          {/* Central Glow Effect */}
          <div className="absolute inset-0 blur-[100px] bg-orange-500/20 rounded-full scale-150"></div>
          
          <h1 className="text-8xl md:text-9xl font-[900] tracking-tighter text-white leading-none drop-shadow-2xl">
            FRUIT
          </h1>
          <h1 className="text-8xl md:text-9xl font-[900] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#ffcc33] to-[#ff6633] leading-none -mt-4">
            SLICER
          </h1>
          <p className="text-cyan-400 font-black tracking-[0.5em] text-xs mt-6 uppercase animate-pulse">
            Master the Blade
          </p>
        </motion.div>

        {/* 3. Best Score Badge */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 px-8 py-4 rounded-3xl flex items-center gap-5 shadow-2xl mb-14 backdrop-blur-xl"
        >
          <div className="bg-orange-500/20 p-2.5 rounded-2xl">
            <Trophy className="text-orange-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]" />
          </div>
          <div className="flex flex-col items-start border-l border-white/10 pl-5">
            <span className="text-orange-400/80 font-bold uppercase text-[10px] tracking-[0.2em]">
              High Score
            </span>
            <span className="text-3xl font-black text-white leading-none">
              {loadingBoard ? '...' : topScore.toLocaleString()}
            </span>
          </div>
        </motion.div>

        <div className="w-full max-w-xl mb-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl p-5">
          <p className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-[0.2em] mb-3 text-left">Top Players</p>
          {loadingBoard ? (
            <p className="text-sm text-gray-400 text-left">Loading leaderboard...</p>
          ) : boardError ? (
            <div className="text-sm text-red-400 text-left">
              Failed to load leaderboard. {boardError}
              <button onClick={loadLeaderboard} className="ml-4 px-3 py-1 bg-cyan-500 text-black rounded">Retry</button>
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-sm text-gray-400 text-left">No scores yet. Be the first player.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((row, index) => (
                <div key={`${row.username}-${index}`} className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-orange-400 font-black w-6 text-left">#{index + 1}</span>
                    <span className="text-sm text-white font-semibold">{row.username}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-purple-300 font-bold uppercase">Lvl</span>
                      <span className="text-sm text-purple-400 font-black">{row.level || getLevel(row.best_score)}</span>
                    </div>
                    <span className="text-sm text-cyan-300 font-bold">{Number(row.best_score || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Play Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255,95,109,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/play')}
          className="px-24 py-7 bg-gradient-to-r from-[#ff5f6d] to-[#ffc371] text-white text-4xl font-[1000] rounded-[2.5rem] shadow-[0_12px_0_rgb(185,28,28)] active:shadow-none active:translate-y-3 transition-all uppercase tracking-tighter"
        >
          Play Now
        </motion.button>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px]"></div>
    </div>
  );
};

export default Home;