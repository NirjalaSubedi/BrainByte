import React from 'react';
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
              3,400
            </span>
          </div>
        </motion.div>

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