import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Game = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  // Game Constants
  const GRAVITY = 0.25;
  const FRUITS = ['🍉', '🍊', '🍎', '🍓', '🍍'];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let fruits = [];
    let animationId;
    let mouseIsDown = false;
    let trail = []; // Slicing line trail

    class Fruit {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.size = 40;
        this.emoji = FRUITS[Math.floor(Math.random() * FRUITS.length)];
        this.speedX = (Math.random() - 0.5) * 8; // Horizontal move
        this.speedY = -(Math.random() * 12 + 10); // Initial jump
        this.sliced = false;
      }

      update() {
        this.speedY += GRAVITY;
        this.x += this.speedX;
        this.y += this.speedY;
      }

      draw() {
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        if (!this.sliced) {
          ctx.fillText(this.emoji, this.x, this.y);
        } else {
          // Sliced effect (pachi advanced banaune)
          ctx.globalAlpha = 0.5;
          ctx.fillText(this.emoji, this.x - 10, this.y);
          ctx.fillText(this.emoji, this.x + 10, this.y);
          ctx.globalAlpha = 1;
        }
      }
    }

    const spawnFruit = () => {
      if (Math.random() < 0.03) fruits.push(new Fruit());
    };

    const handleSlicing = (mx, my) => {
      fruits.forEach(fruit => {
        if (!fruit.sliced) {
          const dist = Math.hypot(fruit.x - mx, fruit.y - my);
          if (dist < 40) {
            fruit.sliced = true;
            setScore(prev => prev + 10);
          }
        }
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      spawnFruit();

      fruits.forEach((fruit, index) => {
        fruit.update();
        fruit.draw();

        // Check if missed
        if (fruit.y > canvas.height + 50) {
          if (!fruit.sliced) setLives(prev => Math.max(0, prev - 1));
          fruits.splice(index, 1);
        }
      });

      // Draw Slice Trail
      if (trail.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.moveTo(trail[0].x, trail[0].y);
        trail.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        if (trail.length > 10) trail.shift();
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
  }, []);

  // Game Over Check
  useEffect(() => {
    if (lives === 0) {
      // Pachi backend ma score save garne logic yaha halne
      alert(`Game Over! Your Score: ${score}`);
      navigate('/');
    }
  }, [lives]);

  return (
    <div className="relative w-full h-screen bg-[#0a0a1a] cursor-crosshair overflow-hidden">
      {/* UI Overlay */}
      <div className="absolute top-5 left-5 text-white z-20">
        <h2 className="text-xl font-bold opacity-70">SCORE</h2>
        <p className="text-4xl font-black text-white">{score}</p>
      </div>

      <div className="absolute top-5 right-5 flex gap-2 z-20">
        {[...Array(3)].map((_, i) => (
          <span key={i} className={`text-3xl ${i < lives ? 'grayscale-0' : 'grayscale'}`}>❤️</span>
        ))}
      </div>

      <canvas ref={canvasRef} className="block" />
      
      <div className="absolute bottom-5 w-full text-center text-white/30 italic text-sm">
        SWIPE TO SLICE • AVOID FALLING FRUITS
      </div>
    </div>
  );
};

export default Game;