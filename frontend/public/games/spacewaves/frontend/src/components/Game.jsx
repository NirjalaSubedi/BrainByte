import React, { useEffect, useRef, useState } from 'react';

const Game = ({ onGameOver, initialLevel = 1 }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [time, setTime] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [level, setLevel] = useState(initialLevel);
    const [countdown, setCountdown] = useState(3);
    const [gameStarted, setGameStarted] = useState(false);

    const movement = useRef({ up: false, down: false });

    const handleRetry = () => {
        setScore(0); setTime(0); setLevel(initialLevel);
        setIsGameOver(false); setCountdown(3); setGameStarted(false);
        movement.current = { up: false, down: false };
    };

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) setGameStarted(true);
    }, [countdown]);

    useEffect(() => {
        // Game start nabhai wa game over bhayeko bela yo chaldaina
        if (!gameStarted || isGameOver) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let scoreInterval;

        //Score lai instant backend ma pathauna local variable use garne
        let currentScore = 0;
        let localTime = Math.max(0, (initialLevel - 1) * 3);
        let currentLevel = initialLevel;

        setLevel(initialLevel);
        setTime(0);

        const player = {
            x: 150,
            y: canvas.height / 2,
            trail: []
        };

        let obstacles = [];
        let frameCount = 0;

        //Score Fix
        scoreInterval = setInterval(() => {
            currentScore += 5;
            setScore(currentScore); // Frontend update ko lagi
        }, 1000);

        const syncLevel = () => {
            const nextLevel = Math.min(15, Math.floor(localTime / 3) + 1);
            if (nextLevel !== currentLevel) {
                currentLevel = nextLevel;
                setLevel(nextLevel);
            }
        };

        const createObstacle = () => {
            // Crash rokna localTime use gareko[cite: 1]
            const currentGap = Math.max(55, 155 - ((currentLevel - 1) * 7) - (localTime * 0.5));
            const minHeight = 50;
            const availableSpace = canvas.height - currentGap - (minHeight * 2);
            const topHeight = Math.random() * availableSpace + minHeight;
            const commonX = canvas.width + 100;

            obstacles.push({ x: commonX, y: 0, width: 60, height: topHeight, passed: false });
            obstacles.push({ x: commonX, y: topHeight + currentGap, width: 60, height: canvas.height, passed: false });
        };

        // Database Save Fix
        const submitScore = async (finalScore, finalLevel) => {
            try {
                const username = localStorage.getItem('brainbyte_user') || null;
                if (!username) {
                    // if no username present, don't attempt to save
                    console.warn('No username found in localStorage; skipping score submit');
                    return;
                }

                await fetch('http://localhost:5000/add-score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, game_id: 'spacewaves', score: Number(finalScore), level: finalLevel }),
                });
            } catch (err) {
                console.error("Score save error:", err);
            }
        };

        const triggerGameOver = () => {
            setIsGameOver(true);
            clearInterval(scoreInterval);
            cancelAnimationFrame(animationFrameId);
            submitScore(currentScore, currentLevel);
        };

        const update = () => {
            frameCount++;
            if (frameCount % 60 === 0) {
                localTime++;
                setTime(localTime);
                syncLevel();
            }

            const levelBoost = currentLevel - 1;
            let currentSpeed = 4.8 + (levelBoost * 0.65) + (localTime * 0.18);
            const verticalSpeed = 7.5 + (levelBoost * 0.18) + (localTime * 0.06);

            if (movement.current.up) player.y -= verticalSpeed;
            else if (movement.current.down) player.y += verticalSpeed;

            player.trail.push({ x: player.x, y: player.y });
            if (player.trail.length > 25) player.trail.shift();

            if (player.y > canvas.height || player.y < 0) triggerGameOver();

            const spawnRate = Math.max(18, 60 - (levelBoost * 2.2) - (localTime * 0.55));
            if (frameCount % Math.floor(spawnRate) === 0) createObstacle();

            obstacles.forEach((obs, index) => {
                obs.x -= currentSpeed;

                // Collision Detection
                if (player.x + 25 > obs.x && player.x - 25 < obs.x + obs.width &&
                    player.y + 8 > obs.y && player.y - 8 < obs.y + obs.height) {
                    triggerGameOver();
                }

                // Obstacle pass garda score badhaune
                if (!obs.passed && obs.x < player.x) {
                    obs.passed = true;
                    currentScore += 10;
                    setScore(currentScore);
                }

                if (obs.x + obs.width < -100) obstacles.splice(index, 1);
            });
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Trail Drawing
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 2;
            player.trail.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
            ctx.stroke();

            // Player Drawing 
            ctx.save();
            ctx.translate(player.x, player.y);
            const bendAngle = movement.current.up ? -0.4 : (movement.current.down ? 0.4 : 0);
            ctx.rotate(bendAngle);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.lineTo(25, -12);
            ctx.moveTo(40, 0); ctx.lineTo(25, 12);
            ctx.stroke();
            ctx.restore();

            // Obstacles Drawing
            obstacles.forEach(obs => {
                ctx.fillStyle = '#2d0a4e';
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 4;
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
            });

            update();
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleKey = (e, active) => {
            if (e.key === 'ArrowUp' || e.code === 'Space') movement.current.up = active;
            if (e.key === 'ArrowDown') movement.current.down = active;
        };

        window.onkeydown = (e) => handleKey(e, true);
        window.onkeyup = (e) => handleKey(e, false);

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            clearInterval(scoreInterval);
            window.onkeydown = null;
            window.onkeyup = null;
        };
    }, [gameStarted, isGameOver]);

    return (
        <div className="game-wrapper">
            <div className="hud-header">
                <span>LVL {level}</span>
                <span>SCORE {score}</span>
                <span>TIME {time}S</span>
            </div>

            <div className="canvas-container">
                <canvas ref={canvasRef} width={900} height={450} />
            </div>

            {countdown > 0 && <div className="countdown">{countdown}</div>}

            {isGameOver && (
                <div className="death-overlay">
                    <h1 className="death-title">CRASHED!</h1>
                    <div className="final-stats">
                        <p>TOTAL SCORE: <span>{score}</span></p>
                        <p>SURVIVED TIME: <span>{time} SEC</span></p>
                    </div>
                    <div className="btn-row">
                        <button className="retry-btn" onClick={handleRetry}>RETRY</button>

                        <button className="menu-btn" onClick={onGameOver}>MENU</button>
                    </div>
                </div>
            )}

            <style>{`
                .game-wrapper { background: #1a0533; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; font-family: 'Orbitron', sans-serif; overflow: hidden; }
                .hud-header { width: 900px; display: flex; justify-content: space-between; color: white; font-size: 1.2rem; font-weight: 900; margin-bottom: 15px; letter-spacing: 2px; }
                .canvas-container { position: relative; border-top: 6px solid white; border-bottom: 6px solid white; }
                canvas { background: #8b2fc9; display: block; }
                .countdown { position: absolute; font-size: 10rem; color: white; text-shadow: 0 0 30px black; }
                .death-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; z-index: 1000; }
                .death-title { font-size: 5rem; color: #ff00ff; margin-bottom: 20px; }
                .final-stats { text-align: center; margin-bottom: 30px; }
                .final-stats p { font-size: 1.5rem; margin: 5px 0; color: #ccc; }
                .final-stats span { color: #00ffff; font-weight: bold; }
                .btn-row { display: flex; gap: 30px; }
                .retry-btn, .menu-btn { padding: 15px 45px; font-size: 1.2rem; font-weight: bold; cursor: pointer; border: none; font-family: 'Orbitron'; }
                .retry-btn { background: white; color: #2d0a4e; }
                .menu-btn { background: #ff00ff; color: white; border: 3px solid white; }
            `}</style>
        </div>
    );
};

export default Game;