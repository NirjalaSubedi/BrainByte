import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, CheckCircle2, LogOut } from 'lucide-react'; 

import fruitImg from '../image/fruitSlicer.jpg';
import ragdollImg from '../image/ragdoll.png';
import spacewavesImg from '../image/spacewaves.png';
import sudokuImg from '../image/sudoku.png';

const games = [
  { 
    id: 'fruit-slicer', 
    name: 'Fruit Slicer', 
    path: '/games/fruit-slicer/frontend/dist/index.html', // open Fruit Slicer home first
    img: fruitImg 
  },
  { 
    id: 'ragdoll', 
    name: 'Ragdoll', 
    path: '/games/ragdoll-game/dist/index.html', // built from public/games/ragdoll-game/
    img: ragdollImg 
  },
  { 
    id: 'sudoku', 
    name: 'Sudoku', 
    path: '/games/sudoku/frontend/dist/index.html', // built from public/games/sudoku/frontend/
    img: sudokuImg 
  },
  { 
    id: 'spacewaves', 
    name: 'Space Waves', 
    path: '/games/spacewaves/frontend/dist/index.html', // intended built entry for spacewaves
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
    // Login chha vane game ko index.html ma pathaidine
    window.location.href = gamePath;
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
  };

  const closeAndReset = () => {
    setShowModal(false);
    setTimeout(() => {
        setIsRegistered(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#060614] text-white p-6 md:p-10 font-sans relative">
      
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
            whileHover={{ y: -10 }}
            onClick={() => handleGameClick(game.path)} // Updated click handler
            className="cursor-pointer bg-[#11111a] border border-white/5 p-8 rounded-3xl transition-all hover:border-white/20 shadow-2xl group"
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
                    <input required placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    <input required placeholder="Faculty" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500" onChange={(e) => setFormData({...formData, faculty: e.target.value})} />
                    <input required type="number" placeholder="Roll No" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500" onChange={(e) => setFormData({...formData, rollNo: e.target.value})} />
                    <button type="submit" className="w-full bg-cyan-500 p-4 rounded-2xl font-bold text-[#060614] uppercase tracking-widest">Create Profile</button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <h2 className="text-3xl font-black mb-2">Welcome Back</h2>
                    <input required placeholder="Enter Username" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500 font-mono text-cyan-400" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
                    <button type="submit" className="w-full bg-cyan-500 p-4 rounded-2xl font-bold text-[#060614] uppercase tracking-widest">Login</button>
                  </form>
                )}
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
  );
};

export default Dashboard;