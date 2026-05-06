import { useState, useEffect, useRef } from 'react';
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
    id: 'sudoku',
    name: 'Sudoku',
    path: '/games/sudoku/frontend/dist/index.html',
    img: sudokuImg
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
  const handleGameClick = (gamePath) => {
    if (!currentUser) {
      alert("Please login first to play!");
      setShowModal(true);
      return;
    }
    setActiveGamePath(gamePath);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim().toLowerCase().replace(/\s+/g, '');
    const cleanFaculty = formData.faculty.trim().toLowerCase().replace(/\s+/g, '');
    const uniqueUsername = `${cleanName}-${cleanFaculty}-${formData.rollNo}`;

    try {
      const response = await fetch('http://localhost:5000/add-user', {
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
      const response = await fetch('http://localhost:5000/login', {
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

  const handleGesture = (type, pos) => {
    // Edge Expansion Logic (Bounding Box) - Optimized for Range
    // Reduced padding to allow "full hand track" movement as requested.
    const paddingX = 0.18; // Increased range for X
    const paddingY = 0.12; // Increased range for Y
    
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
      
      // Compute iframe-relative coordinates for accurate interaction
      const rect = iframeRef.current.getBoundingClientRect();
      const sendX = x - rect.left;
      const sendY = y - rect.top;
      
      // NATIVE GESTURE COMMUNICATION (Universal postMessage)
      iframeWin.postMessage({
        type: 'BRAINBYTE_GESTURE',
        gesture: type,
        x: sendX,
        y: sendY
      }, '*');

      // FALLBACK: Legacy event simulation
      const now = Date.now();
      if (!iframeLastCheckRef.current || now - iframeLastCheckRef.current > 250) {
        try {
          const iframeDoc = iframeRef.current.contentDocument;
          if (iframeDoc) {
            iframeCachedTargetRef.current = iframeDoc.elementFromPoint(sendX, sendY) || iframeDoc.body;
          }
        } catch (e) {}
        iframeLastCheckRef.current = now;
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
          } catch(err) {}
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
        if (game) handleGameClick(game.path);
      } else if (isPinchJustReleased) {
        wasPinchedRef.current = false;
      }
    } else {
      setHoveredGameId(null);
      if (isPinchJustReleased) {
        wasPinchedRef.current = false;
      } else if (type === 'PINCH') {
        wasPinchedRef.current = true; // Still track pinch even if not over game
      }
    }
  };

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
        <div className="fixed inset-0 w-full h-full bg-black z-50">
          <button 
            id="exit-game-btn"
            onClick={() => setActiveGamePath(null)}
            className="absolute top-4 left-4 z-[999] bg-red-500 hover:bg-red-600 transition-colors text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest shadow-xl cursor-pointer"
          >
            Exit Game
          </button>

          <iframe 
            ref={iframeRef}
            src={activeGamePath} 
            className="w-full h-full border-none shadow-[0_0_100px_rgba(0,239,255,0.3)]"
            title="Game"
          />
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-10" />
        </div>
      ) : (
        <div className="min-h-screen bg-[#060614] text-white p-6 md:p-10 font-sans relative overflow-hidden">

      {/* Header Section */}
      <div className="flex justify-end items-center mb-8 max-w-7xl mx-auto gap-4">
        <AnimatePresence mode="wait">
          {currentUser ? (
            <motion.div
              key="user-panel"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-4 bg-white/5 p-2 pr-4 rounded-2xl border border-white/10 shadow-lg"
            >
              <div className="text-right pl-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Player</p>
                <p className="text-sm font-bold text-cyan-400 font-mono">{currentUser}</p>
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

      <header className="text-center mb-16">
        <motion.h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          BRAIN BYTE
        </motion.h1>
        <p className="text-gray-400 mt-4 uppercase tracking-widest text-sm font-bold">Select Your Challenge</p>
      </header>

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {games.map((game) => (
          <motion.div
            key={game.id}
            data-game-id={game.id}
            whileHover={{ y: -10 }}
            animate={hoveredGameId === game.id ? { y: -10, scale: 1.05, borderColor: 'rgba(0, 239, 255, 0.5)' } : {}}
            onClick={() => handleGameClick(game.path)} // Updated click handler
            className={`cursor-pointer bg-[#11111a] border ${hoveredGameId === game.id ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(0,239,255,0.2)]' : 'border-white/5'} p-8 rounded-3xl transition-all hover:border-white/20 shadow-2xl group`}
          >
            <div className="w-20 h-20 rounded-2xl mb-6 overflow-hidden border border-white/10 group-hover:border-cyan-500/50 transition-colors">
              <img src={game.img} alt={game.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold mb-1">{game.name}</h2>
            <div className="text-xs font-bold text-cyan-400 group-hover:text-white transition-colors">PLAY NOW →</div>
          </motion.div>
        ))}
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