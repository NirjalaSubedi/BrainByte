import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, CheckCircle2, LogOut, MousePointer2 } from 'lucide-react';
import GestureManager from '../components/GestureManager';

import fruitImg from '../image/fruitSlicer.jpg';
import ragdollImg from '../image/ragdoll.png';
import spacewavesImg from '../image/spacewaves.png';
import sudokuImg from '../image/sudoku.png';

const games = [
  {
    id: 'fruit-slicer',
    name: 'Fruit Slicer',
    path: '/games/fruit-slicer/frontend/dist/index.html',
    img: fruitImg
  },
  {
    id: 'ragdoll',
    name: 'Ragdoll',
    path: '/games/ragdoll-game/dist/index.html',
    img: ragdollImg
  },
  {
    id: 'spacewaves',
    name: 'Space Waves',
    path: '/games/spacewaves/frontend/dist/index.html',
    img: spacewavesImg
  },
];

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', faculty: '', rollNo: '' });
  const [authMode, setAuthMode] = useState('register');
  const [loginUsername, setLoginUsername] = useState('');
  const [hoveredGameId, setHoveredGameId] = useState(null);
  const [activeGamePath, setActiveGamePath] = useState(null);
  const [activeGameId, setActiveGameId] = useState(null);

  // Real-time Game Stats
  const [gameStats, setGameStats] = useState({
    playerScore: 0,
    enemyScore: 0,
    round: 1,
    timer: '00:00.000',
    isGameOver: false
  });

  const [leaderboard, setLeaderboard] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const cursorRef = useRef(null);
  const iframeRef = useRef(null);
  const wasPinchedRef = useRef(false);

  // Refs for iframe interaction tracking to avoid modifying DOM properties directly
  const iframeCachedTargetRef = useRef(null);
  const iframeLastCheckRef = useRef(0);

  // LocalStorage bata user status check garne (Persistent login ko lagi)
  useEffect(() => {
    const savedUser = localStorage.getItem('brainbyte_user');
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  // Game click handle garne logic
  const handleGameClick = (game) => {
    if (!currentUser) {
      alert("Please login first to play!");
      setShowModal(true);
      return;
    }
    setActiveGamePath(game.path);
    setActiveGameId(game.id);

    // Reset stats for new session
    setGameStats({
      playerScore: 0,
      enemyScore: 0,
      round: 1,
      timer: '00:00.000',
      isGameOver: false
    });
  };

  const saveScore = useCallback(async (score, enemyScore, time) => {
    if (!currentUser) {
      console.warn("Save skipped: No currentUser");
      return;
    }
    
    console.log("Saving score for:", currentUser, { score, enemyScore, time });
    
    try {
      const response = await fetch(`${API_BASE_URL}/ragdoll-scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          playerScore: score,
          enemyScore,
          time
        })
      });
      
      if (response.ok) {
        console.log("Score saved successfully!");
        fetchLeaderboard();
      } else {
        const errData = await response.json();
        console.error("Score save failed:", errData.message);
      }
    } catch (err) {
      console.error("Score save network error:", err);
    }
  }, [currentUser, API_BASE_URL]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ragdoll-scores/top`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  // Initial leaderboard fetch
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Listen for messages from games
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'GAME_UPDATE') {
        // Optimization: Only update state if values actually changed to avoid re-renders
        setGameStats(prev => {
          const stats = event.data.stats;
          if (prev.playerScore === stats.playerScore &&
            prev.enemyScore === stats.enemyScore &&
            prev.round === stats.round &&
            prev.timer === stats.timer) return prev;
          return { ...prev, ...stats };
        });
      }

      if (event.data?.type === 'GAME_OVER') {
        const { playerScore, enemyScore, timer } = event.data.stats;
        saveScore(playerScore, enemyScore, timer);
        setGameStats(prev => ({
          ...prev,
          isGameOver: true,
          playerScore,
          enemyScore,
          timer
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentUser]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim().toLowerCase().replace(/\s+/g, '');
    const cleanFaculty = formData.faculty.trim().toLowerCase().replace(/\s+/g, '');
    const uniqueUsername = `${cleanName}-${cleanFaculty}-${formData.rollNo}`;

    try {
      const response = await fetch(`${API_BASE_URL}/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: uniqueUsername,
          faculty_name: formData.faculty,
          roll_no: formData.rollNo
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('brainbyte_user', uniqueUsername);
        setCurrentUser(uniqueUsername);
        setIsRegistered(true);
      } else {
        alert(data.message || "Registration failed!");
      }
    } catch (error) {
      alert("Backend Error: Is your server running?");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('brainbyte_user', data.user.username);
        setCurrentUser(data.user.username);
        setShowModal(false);
        setLoginUsername('');
      } else {
        alert(data.message || "Invalid username!");
      }
    } catch (error) {
      alert("Server error! Make sure your backend is running.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('brainbyte_user');
    setCurrentUser(null);
    setIsRegistered(false);
    setFormData({ name: '', faculty: '', rollNo: '' });
    setLoginUsername('');
  };

  const closeAndReset = () => {
    setShowModal(false);
    setFormData({ name: '', faculty: '', rollNo: '' });
    setLoginUsername('');
    setTimeout(() => {
      setIsRegistered(false);
    }, 500);
  };

  const handleGesture = useCallback((type, pos) => {
    // Cache rect for 1 second to avoid layout thrashing
    const now = Date.now();
    if (!window._iframeRect || !window._lastRectUpdate || now - window._lastRectUpdate > 1000) {
      if (iframeRef.current) {
        window._iframeRect = iframeRef.current.getBoundingClientRect();
        window._lastRectUpdate = now;
      }
    }

    // Edge Expansion Logic (Bounding Box) - Optimized for Range
    const paddingX = 0.18;
    const paddingY = 0.12;

    const expandedX = (pos.x - paddingX) / (1 - 2 * paddingX);
    const expandedY = (pos.y - paddingY) / (1 - 2 * paddingY);
    const clampedX = Math.max(0, Math.min(1, expandedX));
    const clampedY = Math.max(0, Math.min(1, expandedY));

    // Invert X because camera is mirrored
    const x = (1 - clampedX) * window.innerWidth;
    const y = clampedY * window.innerHeight;

    // DIRECT DOM UPDATE: High-performance cursor rendering (Stable Mode)
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${x}px, ${y}px) scale(${type === 'PINCH' ? 1.4 : 1})`;
      cursorRef.current.style.borderColor = type === 'PINCH' ? '#ff3333' : '#00efff';
      cursorRef.current.style.boxShadow = type === 'PINCH' ? '0 0 40px rgba(255, 51, 51, 0.6)' : '0 0 30px rgba(0, 239, 255, 0.4)';

      const innerDot = cursorRef.current.children[0];
      if (innerDot) {
        innerDot.style.transform = `scale(${type === 'PINCH' ? 2.5 : 1})`;
        innerDot.style.backgroundColor = type === 'PINCH' ? '#ff3333' : '#00efff';
      }
    }

    // Determine Pinch Start/End
    const isPinchJustStarted = type === 'PINCH' && !wasPinchedRef.current;
    const isPinchJustReleased = type === 'MOVE' && wasPinchedRef.current;

    // Check for UI elements in the parent document (like the Exit button)
    const elementsAtCursor = document.elementsFromPoint(x, y);
    const isOverExit = elementsAtCursor.some(el => el.id === 'exit-game-btn');

    if (isOverExit) {
      if (isPinchJustStarted) {
        setActiveGamePath(null);
        wasPinchedRef.current = true;
      } else if (isPinchJustReleased) {
        wasPinchedRef.current = false;
      }
      return;
    }

    if (activeGamePath && iframeRef.current && iframeRef.current.contentWindow) {
      const iframeWin = iframeRef.current.contentWindow;

      const rect = window._iframeRect;
      if (!rect) return;
      const sendX = x - rect.left;
      const sendY = y - rect.top;

      // NATIVE GESTURE COMMUNICATION (Universal postMessage)
      // Optimization: Throttle to 32ms (approx 30fps) and only send if moved significantly
      const nowTime = Date.now();
      const lastX = window._lastX || 0;
      const lastY = window._lastY || 0;
      const distSq = (sendX - lastX) ** 2 + (sendY - lastY) ** 2;

      if ((!window._lastGestureTime || nowTime - window._lastGestureTime > 32) && (distSq > 16 || type !== 'MOVE')) {
        iframeWin.postMessage({
          type: 'BRAINBYTE_GESTURE',
          gesture: type,
          x: sendX,
          y: sendY
        }, '*');
        window._lastGestureTime = nowTime;
        window._lastX = sendX;
        window._lastY = sendY;
      }

      // FALLBACK: Legacy event simulation
      const currentTime = Date.now();
      if (!iframeLastCheckRef.current || currentTime - iframeLastCheckRef.current > 250) {
        try {
          const iframeDoc = iframeRef.current.contentDocument;
          if (iframeDoc) {
            iframeCachedTargetRef.current = iframeDoc.elementFromPoint(sendX, sendY) || iframeDoc.body;
          }
        } catch (e) { }
        iframeLastCheckRef.current = currentTime;
      }

      const el = iframeCachedTargetRef.current;
      if (el) {
        const simulateEvent = (eventType) => {
          const currentPinched = eventType === 'down' || (eventType === 'move' && wasPinchedRef.current);

          const opts = {
            view: iframeWin,
            bubbles: true,
            cancelable: true,
            clientX: sendX,
            clientY: sendY,
            screenX: sendX,
            screenY: sendY,
            pointerId: 1,
            pointerType: 'mouse',
            buttons: currentPinched ? 1 : 0,
            pressure: currentPinched ? 0.5 : 0
          };

          try {
            if (eventType === 'down') {
              el.dispatchEvent(new PointerEvent('pointerdown', opts));
              el.dispatchEvent(new MouseEvent('mousedown', opts));
            } else if (eventType === 'move') {
              el.dispatchEvent(new PointerEvent('pointermove', opts));
              el.dispatchEvent(new MouseEvent('mousemove', opts));
            } else if (eventType === 'up') {
              el.dispatchEvent(new PointerEvent('pointerup', opts));
              el.dispatchEvent(new MouseEvent('mouseup', opts));
              el.dispatchEvent(new MouseEvent('click', opts));
            }
          } catch { }
        };

        if (type === 'PINCH') {
          if (!wasPinchedRef.current) {
            simulateEvent('down');
            wasPinchedRef.current = true;
          } else {
            simulateEvent('move');
          }
        } else if (type === 'MOVE') {
          if (wasPinchedRef.current) {
            simulateEvent('up');
            wasPinchedRef.current = false;
          } else {
            simulateEvent('move');
          }
        }
      }
      return;
    }

    // Check which game is being hovered (Only when not in a game)
    const gameCard = elementsAtCursor.find(el => el.dataset.gameId);

    if (gameCard) {
      const gId = gameCard.dataset.gameId;
      setHoveredGameId(gId);

      if (isPinchJustStarted) {
        wasPinchedRef.current = true;
        const game = games.find(g => g.id === gId);
        if (game) handleGameClick(game);
      } else if (isPinchJustReleased) {
        wasPinchedRef.current = false;
      }
    } else {
      setHoveredGameId(null);
      if (isPinchJustReleased) {
        wasPinchedRef.current = false;
      } else if (type === 'PINCH') {
      }
    }
  }, [activeGamePath, currentUser, handleGameClick, games]);

  return (
    <>
      <GestureManager onGesture={handleGesture} />

      {/* Virtual Cursor (Direct DOM update for zero lag) */}
      <div
        ref={cursorRef}
        style={{ transform: 'translate(-100px, -100px)', zIndex: 1000 }}
        className="fixed top-0 left-0 w-10 h-10 border-4 border-cyan-400 rounded-full pointer-events-none flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-colors duration-150"
      >
        <div className="w-2 h-2 bg-cyan-400 rounded-full transition-transform duration-150" />
      </div>

      {activeGamePath ? (
        <div className="fixed inset-0 w-full h-full bg-[#0a0a0a] z-50 flex overflow-hidden">
          {/* Main Game Container */}
          <div className="flex-1 relative flex flex-col">
            <div className="h-14 flex items-center justify-between px-10 border-b border-white/5 bg-black/20">
              <div className="flex items-center gap-8 text-[11px] font-black text-white/40 tracking-widest">
                <span className="text-white border-b-2 border-white pb-1 cursor-pointer">1 PLAYER</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[9px] text-orange-500 font-black uppercase tracking-widest">Season 1</p>
                  <p className="text-sm font-black text-white">SCORE {gameStats.playerScore}/3</p>
                </div>
                <button
                  id="exit-game-btn"
                  onClick={() => setActiveGamePath(null)}
                  className="bg-white/10 hover:bg-red-500/80 transition-all text-white px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest border border-white/10"
                >
                  CLOSE
                </button>
              </div>
            </div>

            <div className="flex-1 relative">
              <iframe
                ref={iframeRef}
                src={activeGamePath}
                className="w-full h-full border-none"
                title="Game"
              />
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] z-10" />
            </div>

            {/* Footer removed as requested */}
          </div>

          {/* Right Sidebar - Leaderboard (Stylized) */}
          {activeGameId === 'ragdoll' && (
            <motion.div
              initial={{ x: 300 }} animate={{ x: 0 }}
              className="w-80 h-full bg-black/40 backdrop-blur-md border-l border-white/5 flex flex-col p-8 z-20"
            >
              <div className="mb-10 text-center">
                <h3 className="text-white/80 text-xl font-black uppercase tracking-tighter italic">Season 1 Leaders</h3>
                <div className="h-0.5 w-12 bg-orange-500 mx-auto mt-2" />
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 group">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-white/30 font-bold w-6">#{idx + 1}</span>
                        <span className={`text-[11px] font-black uppercase tracking-tight ${entry.username === currentUser ? 'text-orange-500' : 'text-white/70'}`}>
                          {entry.username.split('-')[0]}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-white/50 font-bold">{entry.play_time || '00:00.000'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[10px] text-white/20 uppercase font-black py-10">No records found</p>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">#{leaderboard.findIndex(e => e.username === currentUser) + 1 || '---'} YOU</span>
                  <span className="text-xs font-mono text-white font-bold">{gameStats.timer}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="min-h-screen bg-[#060614] text-white p-6 md:p-10 font-sans relative overflow-hidden">

          {/* Header Section */}
          <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
                <CheckCircle2 className="text-cyan-400" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white uppercase">BrainByte</h1>
                <p className="text-[9px] text-cyan-500 font-bold tracking-widest uppercase">Gesture Gaming</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {currentUser ? (
                <motion.div
                  key="user-panel"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 bg-white/5 p-2 pr-4 rounded-2xl border border-white/10 shadow-lg"
                >
                  <div className="text-right pl-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Player</p>
                    <p className="text-sm font-bold text-cyan-400 font-mono">{currentUser.split('-')[0]}</p>
                  </div>
                  <button onClick={handleLogout} className="p-2 hover:bg-red-500/20 rounded-xl transition-colors text-gray-400 hover:text-red-400">
                    <LogOut size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="login-icon"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowModal(true)}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-all shadow-xl"
                >
                  <User className="text-gray-400" size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <header className="text-center mb-16 relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
            >
              BRAIN BYTE
            </motion.h1>
            <p className="text-gray-400 mt-4 uppercase tracking-[0.3em] text-xs font-bold">The Future of Interactive Gaming</p>
          </header>

          <div className="max-w-7xl mx-auto">
            {/* Game Grid */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Available Games</h2>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {games.map((game) => (
                  <motion.div
                    key={game.id}
                    data-game-id={game.id}
                    whileHover={{ y: -10 }}
                    animate={hoveredGameId === game.id ? { y: -10, scale: 1.02, borderColor: 'rgba(0, 239, 255, 0.5)' } : {}}
                    onClick={() => handleGameClick(game)}
                    className={`cursor-pointer bg-white/5 border ${hoveredGameId === game.id ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(0,239,255,0.1)]' : 'border-white/5'} p-6 rounded-[2.5rem] transition-all hover:bg-white/[0.07] group relative overflow-hidden`}
                  >
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden border border-white/10 group-hover:border-cyan-500/50 transition-all shadow-2xl">
                        <img src={game.img} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black mb-1 group-hover:text-cyan-400 transition-colors uppercase italic">{game.name}</h2>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Challenge</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MousePointer2 className="text-cyan-500" size={24} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Auth Modal */}
          <AnimatePresence>
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0c0c16] border border-white/10 p-8 rounded-[2rem] max-w-md w-full relative shadow-2xl">
                  <button onClick={closeAndReset} className="absolute top-6 right-6 text-gray-500 hover:text-white">
                    <X size={24} />
                  </button>

                  <div className="pt-4">
                    <div className="flex gap-4 mb-8 bg-white/5 p-1 rounded-xl">
                      <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${authMode === 'register' ? 'bg-cyan-500 text-black' : 'text-gray-400'}`}>REGISTER</button>
                      <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${authMode === 'login' ? 'bg-cyan-500 text-black' : 'text-gray-400'}`}>LOGIN</button>
                    </div>

                    {authMode === 'register' ? (
                      <form onSubmit={handleRegister} className="space-y-4">
                        <h2 className="text-3xl font-black mb-2">New Identity</h2>
                        <input required placeholder="Full Name" value={formData.name} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        <input required placeholder="Faculty" value={formData.faculty} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500" onChange={(e) => setFormData({ ...formData, faculty: e.target.value })} />
                        <input required type="number" placeholder="Roll No" value={formData.rollNo} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500" onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })} />
                        <button type="submit" className="w-full bg-cyan-500 p-4 rounded-2xl font-bold text-[#060614] uppercase tracking-widest">Create Profile</button>
                      </form>
                    ) : (
                      <form onSubmit={handleLogin} className="space-y-4">
                        <h2 className="text-3xl font-black mb-2">Welcome Back</h2>
                        <input required placeholder="Enter Username" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500 font-mono text-cyan-400" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
                        <button type="submit" className="w-full bg-cyan-500 p-4 rounded-2xl font-bold text-[#060614] uppercase tracking-widest">Login</button>
                      </form>
                    )}

                    {/* Guest Mode Button for Gesture Control */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const guestName = `Guest-${Math.floor(Math.random() * 10000)}`;
                          localStorage.setItem('brainbyte_user', guestName);
                          setCurrentUser(guestName);
                          setShowModal(false);
                        }}
                        className="w-full bg-transparent border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-400 p-4 rounded-2xl font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,239,255,0.2)] hover:shadow-[0_0_25px_rgba(0,239,255,0.5)] flex items-center justify-center gap-2"
                      >
                        <MousePointer2 size={18} />
                        Quick Play (Guest)
                      </button>
                      <p className="text-[10px] text-gray-500 text-center mt-3 uppercase tracking-widest">Perfect for gesture control</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Success Modal */}
          <AnimatePresence>
            {isRegistered && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0c0c16] border border-white/10 p-8 rounded-[2rem] max-w-md w-full text-center shadow-2xl">
                  <div className="flex justify-center mb-6"><CheckCircle2 size={60} className="text-emerald-500" /></div>
                  <h2 className="text-2xl font-bold mb-8">Profile Created!</h2>
                  <div className="bg-white/5 p-4 rounded-2xl mb-8 border border-white/10">
                    <p className="text-lg font-mono text-cyan-400 font-bold">{currentUser}</p>
                  </div>
                  <button onClick={closeAndReset} className="w-full bg-cyan-500 p-4 rounded-2xl font-bold text-[#060614]">Continue</button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default Dashboard;