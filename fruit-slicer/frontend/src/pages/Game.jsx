import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';


const Game = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  // Game States
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // 1. Difficulty Constants
  const GRAVITY = 2;
  const LEVEL_DURATION = 30000; // 30 seconds

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let fruits = [];
    let animationId;
    let trail = [];
    let startTime = Date.now();

    // 2. Dynamic Speed Settings (Level calculate garne)
    const getSpeedSettings = () => {
      // Level badhdai jada speedMultiplier badhchha
      const speedMultiplier = 1 + (level - 1) * 0.25; 
      const spawnRate = 0.02 + (level * 0.005); // Level badhda fruit dherai aauchha
      return { speedMultiplier, spawnRate };
    };

    class Fruit {
      constructor() {
        const { speedMultiplier } = getSpeedSettings();
        // ... fruit image selection logic ...
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = canvas.height + 50;
        this.size = 80;
        
        // Level anusar speed badhaune
        this.speedX = (Math.random() - 0.5) * (6 * speedMultiplier);
        this.speedY = -(Math.random() * 8 + (10 * speedMultiplier)); // Jump force
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.sliced = false;
      }

      update() {
        this.speedY += GRAVITY;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
      }
      
      // ... draw() method same hunchha ...
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const { spawnRate } = getSpeedSettings();
      if (Math.random() < spawnRate) fruits.push(new Fruit());

      // 3. Level Up Checker (Harek 30 sec ma)
      const currentTime = Date.now();
      if (currentTime - startTime > LEVEL_DURATION) {
        setLevel(prev => {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 2000);
          return prev + 1;
        });
        startTime = currentTime; // Reset timer for next level
      }

      fruits.forEach((fruit, index) => {
        fruit.update();
        fruit.draw();
        // ... Missed fruit logic ...
      });

      // ... Trail logic ...

      animationId = requestAnimationFrame(animate);
    };

    animate();
    // ... event listeners cleanup ...
  }, [level]); // Level change huda settings refresh hunchha

  return (
    <div className="relative w-full h-screen bg-[#0a0a1a] overflow-hidden">
      
      {/* Level Up UI Effect */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <h1 className="text-8xl font-black text-yellow-400 italic drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]">
              LEVEL {level}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <div className="absolute top-10 left-10 z-20">
        <div className="flex gap-10 items-center">
          <div>
            <p className="text-orange-400 font-bold text-xs tracking-widest">SCORE</p>
            <h2 className="text-5xl font-black text-white">{score}</h2>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
            <p className="text-cyan-400 font-bold text-[10px] tracking-widest">LEVEL</p>
            <h2 className="text-2xl font-black text-white text-center">{level}</h2>
          </div>
        </div>
      </div>

      {/* ... Hearts and Canvas ... */}
      <canvas ref={canvasRef} />
    </div>
  );
};
export default Game;