import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Assets Imports
import appleImg from '../assets/Apple.png';
import bananaImg from '../assets/banana.png';
import grapesBlackImg from '../assets/grapes-black.png';
import grapesImg from '../assets/grapes.png';
import strawberryImg from '../assets/strawberry.png';
import mangoImg from '../assets/mango.png';
import pineappleImg from '../assets/pineapple.png';
import watermelonImg from '../assets/watermelon.png';

const Game = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [timer, setTimer] = useState(0); // नयाँ Timer State
  const [showLevelUp, setShowLevelUp] = useState(false);

  const GRAVITY = 0.25; 
  const LEVEL_DURATION = 30000;

  const FRUIT_ASSETS = [
    { name: 'apple', img: appleImg },
    { name: 'banana', img: bananaImg },
    { name: 'grapesBlack', img: grapesBlackImg },
    { name: 'grapes', img: grapesImg },
    { name: 'strawberry', img: strawberryImg },
    { name: 'mango', img: mangoImg },
    { name: 'pineapple', img: pineappleImg },
    { name: 'watermelon', img: watermelonImg },
  ];

  // 1. Timer Logic: हरेक १ सेकेन्डमा बढ्ने
  useEffect(() => {
    const clock = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Timer लाई Format गर्ने फङ्सन (e.g., 01:25)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let fruits = [];
    let animationId;
    let trail = [];
    let startTime = Date.now();

    const loadedImages = {};
    FRUIT_ASSETS.forEach(fruit => {
      const img = new Image();
      img.src = fruit.img;
      loadedImages[fruit.name] = img;
    });

    const getSpeedSettings = () => {
      const speedMultiplier = 1 + (level - 1) * 0.25; 
      const spawnRate = 0.02 + (level * 0.005);
      return { speedMultiplier, spawnRate };
    };

    class Fruit {
      constructor() {
        const { speedMultiplier } = getSpeedSettings();
        const asset = FRUIT_ASSETS[Math.floor(Math.random() * FRUIT_ASSETS.length)];
        
        this.image = loadedImages[asset.name];
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = canvas.height + 50;
        this.size = 80;
        this.speedX = (Math.random() - 0.5) * (6 * speedMultiplier);
        this.speedY = -(Math.random() * 8 + (10 * speedMultiplier));
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.sliced = false;
        this.sliceGap = 0;
      }

      update() {
        this.speedY += GRAVITY;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        if (this.sliced) {
          this.sliceGap += 5;
        }
      }

      draw() {
        if (!this.image) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (!this.sliced) {
          ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
        } else {
          ctx.save();
          ctx.translate(-this.sliceGap, 0); 
          ctx.beginPath();
          ctx.rect(-this.size, -this.size, this.size, this.size * 2);
          ctx.clip();
          ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
          ctx.restore();

          ctx.save();
          ctx.translate(this.sliceGap, 0);
          ctx.beginPath();
          ctx.rect(0, -this.size, this.size, this.size * 2);
          ctx.clip();
          ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
          ctx.restore();
        }
        ctx.restore();
      }
    }

    const handleSlicing = (mx, my) => {
      fruits.forEach(fruit => {
        if (!fruit.sliced) {
          const dist = Math.hypot(fruit.x - mx, fruit.y - my);
          if (dist < 45) {
            fruit.sliced = true;
            setScore(prev => prev + 10);
          }
        }
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const { spawnRate } = getSpeedSettings();
      if (Math.random() < spawnRate) fruits.push(new Fruit());

      const currentTime = Date.now();
      if (currentTime - startTime > LEVEL_DURATION) {
        setLevel(prev => {
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 2000);
          return prev + 1;
        });
        startTime = currentTime;
      }

      fruits.forEach((fruit, index) => {
        fruit.update();
        fruit.draw();

        if (fruit.y > canvas.height + 150) {
          if (!fruit.sliced) setLives(prev => Math.max(0, prev - 1));
          fruits.splice(index, 1);
        }
      });

      if (trail.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff'; 
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00e5ff';
        ctx.moveTo(trail[0].x, trail[0].y);
        trail.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.shadowBlur = 0;
        if (trail.length > 12) trail.shift();
      }

      animationId = requestAnimationFrame(animate);
    };

    const onMouseMove = (e) => {
      const mx = e.clientX;
      const my = e.clientY;
      trail.push({ x: mx, y: my });
      handleSlicing(mx, my);
    };

    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [level]);

  useEffect(() => {
    if (lives === 0) {
      alert(`Game Over! Score: ${score} | Time: ${formatTime(timer)}`);
      navigate('/');
    }
  }, [lives]);

  return (
    <div className="relative w-full h-screen bg-[#0a0a1a] overflow-hidden cursor-none">
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <h1 className="text-8xl font-black text-yellow-400 italic drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">LEVEL {level}</h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header UI: Score, Timer, Level */}
      <div className="absolute top-10 left-10 z-20 flex gap-8 items-center pointer-events-none">
        <div>
          <p className="text-orange-400 font-bold text-xs tracking-widest">SCORE</p>
          <h2 className="text-5xl font-black text-white leading-none">{score}</h2>
        </div>
        
        {/* Timer Box */}
        <div className="bg-white/5 px-6 py-2 rounded-xl border border-white/10 backdrop-blur-md">
          <p className="text-gray-400 font-bold text-[10px] tracking-widest text-center uppercase">Time</p>
          <h2 className="text-3xl font-mono font-black text-green-400 text-center leading-none">
            {formatTime(timer)}
          </h2>
        </div>

        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
          <p className="text-cyan-400 font-bold text-[10px] tracking-widest uppercase">Level</p>
          <h2 className="text-2xl font-black text-white text-center leading-none">{level}</h2>
        </div>
      </div>

      <div className="absolute top-10 right-10 flex gap-3 z-20 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={`text-4xl transition-all duration-300 ${i < lives ? 'scale-110' : 'opacity-20 grayscale scale-90'}`}>❤️</span>
        ))}
      </div>

      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default Game;