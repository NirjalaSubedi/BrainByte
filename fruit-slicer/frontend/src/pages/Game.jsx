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

// Sound Imports - तिम्रो फोल्डर अनुसारको पाथ
import sliceSound from '../assets/sound/sliceFruit.mp3';
import bombSound from '../assets/sound/explosion.wav';
import levelUpSound from '../assets/sound/levelup.wav';

const Game = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // साउन्ड प्ले गर्ने हेल्पर फङ्सन
  const playSound = (audioFile) => {
    const audio = new Audio(audioFile);
    audio.volume = 0.5; // आवाज अलि सानो बनाउन (० देखि १ सम्म)
    audio.play().catch(e => console.log("Audio play error:", e));
  };

  const GRAVITY = 0.25;
  
  const getLevelConfig = (lvl) => {
    return {
      targetScore: 100 + (lvl * 50),
      bombChance: Math.min(0.1 + (lvl * 0.05), 0.5),
      spawnRate: Math.min(0.025 + (lvl * 0.008), 0.1)
    };
  };

  const { targetScore, bombChance, spawnRate } = getLevelConfig(level);

  const FRUIT_ASSETS = [
    { name: 'apple', img: appleImg, color: '#ff4d4d' },
    { name: 'banana', img: bananaImg, color: '#ffe135' },
    { name: 'grapesBlack', img: grapesBlackImg, color: '#6f2da8' },
    { name: 'grapes', img: grapesImg, color: '#b5e48c' },
    { name: 'strawberry', img: strawberryImg, color: '#ff0000' },
    { name: 'mango', img: mangoImg, color: '#ffcc33' },
    { name: 'pineapple', img: pineappleImg, color: '#f3e5ab' },
    { name: 'watermelon', img: watermelonImg, color: '#2ecc71' }
  ];

  useEffect(() => {
    if (timeLeft <= 0 || isTransitioning) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTransitioning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let objects = [];
    let explosions = [];
    let juiceParticles = [];
    let floatingTexts = [];
    let trail = [];
    let animationId;
    let screenShake = 0;

    const loadedImages = {};
    [...FRUIT_ASSETS, {name:'bomb', img:bombImg}, {name:'explosion', img:explosionImg}].forEach(asset => {
      const img = new Image();
      img.src = asset.img;
      loadedImages[asset.name] = img;
    });

    class GameObject {
      constructor(isBomb = false) {
        this.isBomb = isBomb;
        const asset = isBomb ? {name:'bomb', color: '#ffffff'} : FRUIT_ASSETS[Math.floor(Math.random() * FRUIT_ASSETS.length)];
        this.image = loadedImages[asset.name];
        this.color = asset.color;
        this.x = Math.random() * (canvas.width - 200) + 100;
        this.y = canvas.height + 50;
        this.size = isBomb ? 140 : 130;
        this.speedX = (Math.random() - 0.5) * (6 + (level * 0.5));
        this.speedY = -(Math.random() * 8 + 11 + (level * 0.6));
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
        if (this.sliced && !this.isBomb) this.sliceGap += 8;
      }

      draw() {
        if (!this.image || (this.isBomb && this.sliced)) return;
        const ratio = this.image.width / this.image.height;
        const dWidth = this.size;
        const dHeight = this.size / ratio;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        if (!this.sliced) {
          ctx.drawImage(this.image, -dWidth/2, -dHeight/2, dWidth, dHeight);
        } else {
          ctx.save(); ctx.translate(-this.sliceGap, 0); ctx.beginPath(); ctx.rect(-dWidth, -dHeight, dWidth, dHeight*2); ctx.clip(); ctx.drawImage(this.image, -dWidth/2, -dHeight/2, dWidth, dHeight); ctx.restore();
          ctx.save(); ctx.translate(this.sliceGap, 0); ctx.beginPath(); ctx.rect(0, -dHeight, dWidth, dHeight*2); ctx.clip(); ctx.drawImage(this.image, -dWidth/2, -dHeight/2, dWidth, dHeight); ctx.restore();
        }
        ctx.restore();
      }
    }

    const animate = () => {
      ctx.save();
      if (screenShake > 0) {
        ctx.translate((Math.random()-0.5)*screenShake, (Math.random()-0.5)*screenShake);
        screenShake *= 0.9;
      }
      ctx.clearRect(-100, -100, canvas.width+200, canvas.height+200);

      juiceParticles.forEach((p, index) => {
        ctx.save();
        ctx.globalAlpha = p.life / 40;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life--;
        if (p.life <= 0) juiceParticles.splice(index, 1);
      });

      if (trail.length > 2) {
        ctx.save();
        ctx.beginPath(); ctx.strokeStyle = "white"; ctx.lineWidth = 6;
        ctx.shadowColor = "#00e5ff"; ctx.shadowBlur = 15;
        ctx.lineCap = "round";
        ctx.moveTo(trail[0].x, trail[0].y);
        for(let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
        ctx.restore();
        if (trail.length > 12) trail.shift();
      }

      if (Math.random() < spawnRate && !isTransitioning) {
        objects.push(new GameObject(Math.random() < bombChance));
      }

      objects.forEach((obj, i) => {
        obj.update();
        obj.draw();
        if (obj.y > canvas.height + 150) objects.splice(i, 1);
      });

      for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        ctx.drawImage(loadedImages['explosion'], exp.x-250, exp.y-250, 500, 500);
        exp.life--;
        if (exp.life <= 0) explosions.splice(i, 1);
      }

      floatingTexts.forEach((ft, i) => {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = ft.isBomb ? "white" : "#00d9ff"; 
        ctx.fillStyle = ft.isBomb ? `rgba(255, 0, 0, ${ft.life / 40})` : `rgba(255, 255, 255, ${ft.life / 40})`;
        ctx.font = "bold 60px Arial"; ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        ft.y -= 3; ft.life--;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
      });

      ctx.restore();
      animationId = requestAnimationFrame(animate);
    };

    const handleSlicing = (mx, my) => {
      if (isTransitioning) return;
      trail.push({ x: mx, y: my });
      objects.forEach(obj => {
        if (!obj.sliced && Math.hypot(obj.x - mx, obj.y - my) < 70) {
          obj.sliced = true;
          if (obj.isBomb) {
            playSound(bombSound); // बम पड्किएको साउन्ड
            explosions.push({ x: obj.x, y: obj.y, life: 25 });
            floatingTexts.push({ x: obj.x, y: obj.y - 100, life: 40, text: "-10s", isBomb: true });
            screenShake = 30;
            setTimeLeft(prev => Math.max(0, prev - 10));
          } else {
            playSound(sliceSound); // फल काटिएको साउन्ड
            setScore(prev => prev + 10);
            floatingTexts.push({ x: obj.x, y: obj.y - 50, life: 30, text: "+10", isBomb: false });
            for (let i = 0; i < 40; i++) {
              juiceParticles.push({
                x: obj.x, y: obj.y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 6 + 2,
                color: obj.color,
                life: 40
              });
            }
          }
        }
      });
    };

    window.addEventListener('mousemove', (e) => handleSlicing(e.clientX, e.clientY));
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [level, isTransitioning, spawnRate, bombChance]);

  useEffect(() => {
    if (timeLeft <= 0 && !isTransitioning) {
      if (score >= targetScore) {
        if (level >= 20) {
            alert("CONGRATULATIONS! You have mastered all 20 levels!");
            navigate('/');
            return;
        }
        playSound(levelUpSound); // लेभल अप साउन्ड
        setIsTransitioning(true);
        setShowLevelUp(true);
        setTimeout(() => {
          setShowLevelUp(false);
          setLevel(prev => prev + 1);
          setScore(0);
          setTimeLeft(60);
          setIsTransitioning(false);
        }, 3000);
      } else {
        alert(`Game Over! Final Level: ${level}`);
        navigate('/');
      }
    }
  }, [timeLeft, score, targetScore, isTransitioning, level, navigate]);

  return (
    <div className="relative w-full h-screen bg-[#060614] overflow-hidden cursor-none">
      <AnimatePresence>
        {showLevelUp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md">
            <h1 className="text-7xl font-black text-yellow-400 italic text-center">
              LEVEL {level} COMPLETE!<br/>
              <span className="text-3xl text-white">GET READY FOR LEVEL {level + 1}</span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 flex gap-8">
        <div className="bg-black/40 border border-white/10 px-8 py-3 rounded-2xl">
          <p className="text-[10px] text-orange-400 font-bold uppercase text-center">Score</p>
          <h2 className="text-4xl font-black text-white">{score} / {targetScore}</h2>
        </div>
        <div className={`px-8 py-3 rounded-2xl border-2 ${timeLeft < 10 ? 'border-red-500 bg-red-500/20' : 'border-white/10'} bg-black/40`}>
          <p className="text-[10px] text-red-500 font-bold uppercase text-center">Time</p>
          <h2 className="text-4xl font-black text-white">00:{timeLeft.toString().padStart(2, '0')}</h2>
        </div>
      </div>
      
      <div className="absolute top-10 right-10 z-20">
        <div className="bg-cyan-500/20 px-6 py-2 rounded-full border border-cyan-500/50 text-cyan-400 font-black uppercase italic">
          Level {level} / 20
        </div>
      </div>

      <canvas ref={canvasRef} />
    </div>
  );
};

export default Game;