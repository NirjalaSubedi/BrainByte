import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Game.jsx बाट पठाएको score प्राप्त गर्ने
  const score = location.state?.score || 0;
  const bestScore = 340; // यसलाई पछि localStorage बाट तान्न सकिन्छ

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
          <span className="text-cyan-400 font-bold tracking-widest uppercase text-sm">Beginner</span>
        </div>

        <div className="bg-[#11111a] border border-white/5 p-10 rounded-[40px] w-85 text-center mb-10 shadow-2xl">
          <p className="text-gray-500 uppercase text-xs font-bold mb-1">Your Score</p>
          <h2 className="text-7xl font-extrabold text-white mb-4">{score}</h2>
          <div className="h-[1px] bg-white/5 w-full mb-4"></div>
          <p className="text-gray-500 uppercase text-xs font-bold mb-1">Best</p>
          <h2 className="text-2xl font-bold text-yellow-400">{bestScore}</h2>
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