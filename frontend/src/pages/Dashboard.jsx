import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, CheckCircle2 } from 'lucide-react'; 

import fruitImg from '../image/fruitSlicer.jpg';
import ragdollImg from '../image/ragdoll.png';
import spacewavesImg from '../image/spacewaves.png';
import sudokuImg from '../image/sudoku.png';

const games = [
  { id: 'fruit-slicer', name: 'Fruit Slicer', path: '/fruit-slicer', img: fruitImg },
  { id: 'ragdoll', name: 'Ragdoll', path: '/ragdoll', img: ragdollImg },
  { id: 'sudoku', name: 'Sudoku', path: '/sudoku', img: sudokuImg },
  { id: 'spacewaves', name: 'Space Waves', path: '/spacewaves', img: spacewavesImg },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  // New state to keep track of the logged-in user
  const [currentUser, setCurrentUser] = useState(null); 
  const [formData, setFormData] = useState({ name: '', faculty: '', rollNo: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim().toLowerCase().replace(/\s+/g, '');
    const cleanFaculty = formData.faculty.trim().toLowerCase().replace(/\s+/g, '');
    const uniqueUsername = `${cleanName}-${cleanFaculty}-${formData.rollNo}`;
    
    const userData = {
        username: uniqueUsername,
        faculty_name: formData.faculty,
        roll_no: formData.rollNo
    };

    try {
        const response = await fetch('http://localhost:5000/add-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            setCurrentUser(uniqueUsername); // Set the username to display on dashboard
            setIsRegistered(true);
        }
    } catch (error) {
        alert("Backend Error: Is your server running?");
    }
  };

  const closeAndReset = () => {
    setShowModal(false);
    // We don't reset currentUser here so it stays visible on the dashboard
    setTimeout(() => {
        setIsRegistered(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#060614] text-white p-6 md:p-10 font-sans relative">
      
      {/* Top Header Section with Profile Info */}
      <div className="flex justify-end items-center mb-8 max-w-7xl mx-auto gap-4">
        {/* Only show username if it exists */}
        <AnimatePresence>
          {currentUser && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-right mr-2"
            >
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Player</p>
              <p className="text-sm font-bold text-cyan-400 font-mono">{currentUser}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowModal(true)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all shadow-xl border ${
            currentUser ? 'bg-cyan-500/20 border-cyan-500/50' : 'bg-white/5 border-white/10'
          }`}
        >
          <User className={currentUser ? "text-cyan-400" : "text-gray-400"} size={24} />
        </motion.div>
      </div>

      <header className="text-center mb-16">
        <motion.h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          BRAIN BYTE
        </motion.h1>
        <p className="text-gray-400 mt-4 uppercase tracking-widest text-sm font-bold">Select Your Challenge</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {games.map((game) => (
          <motion.div
            key={game.id}
            whileHover={{ y: -10 }}
            onClick={() => navigate(game.path)}
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

      {/* Modal Section */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0c0c16] border border-white/10 p-8 rounded-[2rem] max-w-md w-full relative shadow-2xl"
            >
              <button onClick={closeAndReset} className="absolute top-6 right-6 text-gray-500 hover:text-white">
                <X size={24} />
              </button>

              {!isRegistered ? (
                <div className="pt-4">
                  <h2 className="text-3xl font-black mb-2">New Identity</h2>
                  <p className="text-gray-500 text-sm mb-8">Enter details to save your progress.</p>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <input required placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    <input required placeholder="Faculty" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500" onChange={(e) => setFormData({...formData, faculty: e.target.value})} />
                    <input required type="number" placeholder="Roll No" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500" onChange={(e) => setFormData({...formData, rollNo: e.target.value})} />
                    <button type="submit" className="w-full bg-cyan-500 p-4 rounded-2xl font-bold text-[#060614] uppercase tracking-widest">Create Profile</button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="flex justify-center mb-6"><CheckCircle2 size={60} className="text-emerald-500" /></div>
                  <h2 className="text-2xl font-bold mb-8">Profile Created!</h2>
                  <div className="bg-white/5 p-4 rounded-2xl mb-8 border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Your ID</p>
                    <p className="text-lg font-mono text-cyan-400 font-bold">{currentUser}</p>
                  </div>
                  <button onClick={closeAndReset} className="w-full bg-white/5 p-4 rounded-2xl font-bold border border-white/10">Continue to Games</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;