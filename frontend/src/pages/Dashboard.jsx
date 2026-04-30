import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, CheckCircle2, Copy } from 'lucide-react'; 

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
  const [generatedId, setGeneratedId] = useState('');
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
            setGeneratedId(uniqueUsername);
            setIsRegistered(true); // Alert ko satta yo state change garne
        }
    } catch (error) {
        alert("Backend Error: Server start garnu bhako cha?");
    }
  };

  const closeAndReset = () => {
    setShowModal(false);
    setTimeout(() => {
        setIsRegistered(false);
        setGeneratedId('');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#060614] text-white p-6 md:p-10 font-sans relative">
      
      {/* Profile Icon */}
      <div className="flex justify-end items-center mb-8 max-w-7xl mx-auto">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowModal(true)}
          className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all shadow-xl"
        >
          <User className="text-cyan-400 w-6 h-6" />
        </motion.div>
      </div>

      <header className="text-center mb-16">
        <motion.h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          BRAIN BYTE
        </motion.h1>
        <p className="text-gray-400 mt-4 uppercase tracking-widest text-sm font-bold">Select Your Challenge</p>
      </header>

      {/* Game Cards */}
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
            <div className="text-xs font-bold text-cyan-400">PLAY NOW →</div>
          </motion.div>
        ))}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0c0c16] border border-white/10 p-8 rounded-[2rem] max-w-md w-full relative shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)]"
            >
              <button onClick={closeAndReset} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>

              {!isRegistered ? (
                // FORM STATE
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-3xl font-black mb-2 text-white">New Identity</h2>
                  <p className="text-gray-500 text-sm mb-8">Enter your details to sync highscores.</p>
                  
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em]">Full Name</label>
                      <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-cyan-500 outline-none transition-all" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em]">Faculty</label>
                      <input required className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-cyan-500 outline-none transition-all" onChange={(e) => setFormData({...formData, faculty: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em]">Roll No</label>
                      <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-cyan-500 outline-none transition-all" onChange={(e) => setFormData({...formData, rollNo: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform">
                      Create Profile
                    </button>
                  </form>
                </motion.div>
              ) : (
                // SUCCESS STATE (Improved UI)
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="flex justify-center mb-6">
                    <div className="bg-emerald-500/20 p-4 rounded-full">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Registration Successful!</h2>
                  <p className="text-gray-400 text-sm mb-8">Welcome to BrainByte, your identity is ready.</p>
                  
                  <div className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-6 mb-8 relative group">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Your Unique Username</p>
                    <p className="text-xl font-mono font-bold text-cyan-400 break-all">{generatedId}</p>
                  </div>

                  <button 
                    onClick={closeAndReset}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl font-bold transition-all"
                  >
                    Go to Dashboard
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;