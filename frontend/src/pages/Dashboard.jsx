import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'lucide-react'; 

import fruitImg from '../image/fruitSlicer.jpg';
import ragdollImg from '../image/ragdoll.png';
import spacewavesImg from '../image/spacewaves.png';
import sudokuImg from '../image/sudoku.png';

const games = [
  { id: 'fruit-slicer', name: 'Fruit Slicer', path: '/fruit-slicer', img: fruitImg },
  { id: 'ragdoll', name: 'Ragdoll', path: '/ragdoll', img: ragdollImg },
  { id: 'sudoku', name: 'Sudoku', path: '/sudoku', img: sudokuImg },
  { id: 'spacewaves', name: 'Space Waves', path: '/spacewaves', img: spacewavesImg },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060614] text-white p-6 md:p-10 font-sans">
      {/* Profile Icon only on the Right */}
      <div className="flex justify-end items-center mb-8 max-w-7xl mx-auto">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all shadow-xl"
        >
          <User className="text-cyan-400 w-6 h-6" />
        </motion.div>
      </div>

      <header className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
        >
          BRAIN BYTE
        </motion.h1>
        <p className="text-gray-400 mt-4 uppercase tracking-widest text-sm font-bold">Select Your Challenge</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {games.map((game) => (
          <motion.div
            key={game.id}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate(game.path)}
            className="cursor-pointer bg-[#11111a] border border-white/5 p-8 rounded-3xl transition-all hover:border-white/20 shadow-2xl group"
          >
            <div className="w-20 h-20 rounded-2xl mb-6 overflow-hidden shadow-lg border border-white/10 group-hover:border-cyan-500/50 transition-colors">
              <img 
                src={game.img} 
                alt={game.name} 
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-2xl font-bold mb-1">{game.name}</h2>
            <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">Play for fun</p>
            <div className="text-xs font-bold text-cyan-400 group-hover:text-white transition-colors">PLAY NOW →</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;