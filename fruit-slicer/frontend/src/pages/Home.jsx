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
import bombImg from '../assets/bomb.png';
import explosionImg from '../assets/explosion.png';

const Game = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  const [score, setScore] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const GRAVITY = 0.25;
  
  const getLevelConfig = (lvl) => ({
    targetScore: 100 + (lvl * 50),
    bombChance: 0.1 + (lvl * 0.03),
    spawnRate: 0.025 + (lvl * 0.005)
  });

  const { targetScore, bombChance, spawnRate } = getLevelConfig(level);

  const FRUIT_ASSETS = [
    { name: 'apple', img: appleImg }, { name: 'banana', img: bananaImg },
    { name: 'grapesBlack', img: grapesBlackImg }, { name: 'grapes', img: grapesImg },
    { name: 'strawberry', img: strawberryImg }, { name: 'mango', img: mangoImg },
    { name: 'pineapple', img: pineappleImg }, { name: 'watermelon', img: watermelonImg }
  ];

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let objects = [];
    let explosions = [];
    let floatingTexts = []; 
    let animationId;
    let trail = [];

    const loadedImages = {};
    [...FRUIT_ASSETS, {name:'bomb', img:bombImg}, {name:'explosion', img:explosionImg}].forEach(asset => {
      const img = new Image();
      img.src = asset.img;
      loadedImages[asset.name] = img;
    });

    class GameObject {
      constructor(isBomb = false) {
        this.isBomb = isBomb;
        const asset = isBomb ? {name:'bomb'} : FRUIT_ASSETS[Math.floor(Math.random() * FRUIT_ASSETS.length)];
        this.image = loadedImages[asset.name];
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = canvas.height + 50;
        this.size = isBomb ? 95 : 85; 
        this.speedX = (Math.random() - 0.5) * (6 + level);
        this.speedY = -(Math.random() * 8 + 11 + (level * 0.5));
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
        if (this.sliced && !this.isBomb) this.sliceGap += 5;
      }

      draw() {
        if (!this.image || (this.isBomb && this.sliced)) return;
        const ratio = this.image.width / this.image.height;
        const drawWidth = this.size;
        const drawHeight = this.size / ratio;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.imageSmoothingEnabled = true;

        if (!this.sliced) {
          ctx.drawImage(this.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        } else {
          ctx.save(); ctx.translate(-this.sliceGap, 0); ctx.beginPath(); ctx.rect(-drawWidth, -drawHeight, drawWidth, drawHeight * 2); ctx.clip(); ctx.drawImage(this.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight); ctx.restore();
          ctx.save(); ctx.translate(this.sliceGap, 0); ctx.beginPath(); ctx.rect(0, -drawHeight, drawWidth, drawHeight * 2); ctx.clip(); ctx.drawImage(this.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight); ctx.restore();
        }
        ctx.restore();
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (Math.random() < spawnRate) {
        const isBomb = Math.random() < bombChance;
        objects.push(new GameObject(isBomb));
      }

      objects.forEach((obj, index) => {
        obj.update();
        obj.draw();
        if (obj.y > canvas.height + 150) {
          if (!obj.sliced && !obj.isBomb) setMissedCount(prev => prev + 1);
          objects.splice(index, 1);
        }
      });

      explosions.forEach((exp, index) => {
        ctx.save();
        const shake = (Math.random() - 0.5) * 15;
        ctx.translate(shake, shake);
        ctx.drawImage(loadedImages['explosion'], exp.x - 175, exp.y - 175, 350, 350);
        ctx.restore();
        exp.life--;
        if (exp.life <= 0) explosions.splice(index, 1);
      });

      // IMPROVED: Floating "-10s" Text Logic with Outer Glow
      floatingTexts.forEach((ft, index) => {
        ctx.save();
        const opacity = ft.life / 30;
        
        // Glow effect
        ctx.shadowColor = `rgba(255, 255, 255, ${opacity})`; 
        ctx.shadowBlur = 15;
        
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        
        // Outline for extra visibility
        ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.8})`;
        ctx.lineWidth = 4;
        ctx.strokeText("-10s", ft.x, ft.y);
        
        // Main text color (Bright Red)
        ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`; 
        ctx.fillText("-10s", ft.x, ft.y);
        
        ctx.restore();
        ft.y -= 2.5; 
        ft.life--;
        if (ft.life <= 0) floatingTexts.splice(index, 1);
      });

      if (trail.length > 1) {
        ctx.beginPath(); ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 4;
        ctx.moveTo(trail[0].x, trail[0].y);
        trail.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        if (trail.length > 12) trail.shift();
      }

      animationId = requestAnimationFrame(animate);
    };

    const handleSlicing = (mx, my) => {
      objects.forEach(obj => {
        if (!obj.sliced && Math.hypot(obj.x - mx, obj.y - my) < 45) {
          obj.sliced = true;
          if (obj.isBomb) {
            explosions.push({ x: obj.x, y: obj.y, life: 20 });
            floatingTexts.push({ x: obj.x, y: obj.y, life: 30 }); 
            setTimeLeft(prev => Math.max(0, prev - 10));
          } else {
            setScore(prev => prev + 10);
          }
        }
      });
    };

    window.addEventListener('mousemove', (e) => {
      trail.push({ x: e.clientX, y: e.clientY });
      handleSlicing(e.clientX, e.clientY);
    });

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [level, spawnRate, bombChance]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (score >= targetScore) {
        setShowLevelUp(true);
        setTimeout(() => {
          setShowLevelUp(false);
          setLevel(prev => prev + 1);
          setScore(0);
          setMissedCount(0);
          setTimeLeft(60);
        }, 3000);
      } else {
        alert(`Time's Up! Score: ${score} | Target: ${targetScore}`);
        navigate('/');
      }
    }
  }, [timeLeft, score, targetScore, navigate]);

  return (
    <div className="relative w-full h-screen bg-[#060614] overflow-hidden cursor-none">
      <AnimatePresence>
        {showLevelUp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
            <h1 className="text-7xl font-black text-yellow-400 italic">GO TO LEVEL {level + 1}!</h1>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 text-center">
        <div className={`px-8 py-2 rounded-2xl border-2 ${timeLeft < 10 ? 'border-red-500 animate-pulse' : 'border-white/20'} bg-black/40 backdrop-blur-md`}>
           <h2 className={`text-4xl font-mono font-black ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>
             00:{timeLeft.toString().padStart(2, '0')}
           </h2>
        </div>
      </div>

      <div className="absolute top-10 left-10 z-20 flex gap-6">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <p className="text-orange-400 font-bold text-[10px] tracking-widest uppercase">Score</p>
          <h2 className="text-4xl font-black text-white">{score} <span className="text-sm text-white/30">/ {targetScore}</span></h2>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <p className="text-red-500 font-bold text-[10px] tracking-widest uppercase">Missed</p>
          <h2 className="text-4xl font-black text-white">{missedCount}</h2>
        </div>
      </div>

      <div className="absolute top-10 right-10 z-20">
        <div className="bg-cyan-500/10 px-6 py-2 rounded-full border border-cyan-500/30">
          <span className="text-cyan-400 font-bold tracking-widest uppercase italic">Level {level}</span>
        </div>
      </div>

      <canvas ref={canvasRef} />
      
      <div className="absolute bottom-10 w-full text-center text-white/20 font-bold uppercase tracking-[0.4em] text-xs">
        Unlimited Fruits! Reach {targetScore} to Level Up
      </div>
    </div>
  );
};

export default Game;