import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X } from 'lucide-react'; 

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
  const [formData, setFormData] = useState({ name: '', faculty: '', rollNo: '' });

  // Function to generate Unique Username: name-faculty-rollno
  const handleRegister = async (e) => {
    e.preventDefault();

    // Cleaning the strings: remove spaces and make lowercase
    const cleanName = formData.name.trim().toLowerCase().replace(/\s+/g, '');
    const cleanFaculty = formData.faculty.trim().toLowerCase().replace(/\s+/g, '');
    const roll = formData.rollNo;

    // Creating the unique identity
    const uniqueUsername = `${cleanName}-${cleanFaculty}-${roll}`;
    
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
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Identity Created! Your Unique Username is: ${uniqueUsername}`);
            setShowModal(false);
        } else {
            alert("Error: " + (data.message || "Could not register"));
        }
    } catch (error) {
        console.error("Error registering user:", error);
        alert("Make sure your backend server is running on port 5000!");
    }
  };

  return (
    <div className="min-h-screen bg-[#060614] text-white p-6 md:p-10 font-sans relative">
      
      {/* Profile Icon (Click to Register) */}
      <div className="flex justify-end items-center mb-8 max-w-7xl mx-auto">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          onClick={() => setShowModal(true)}
          className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all shadow-xl"
        >
          <User className="text-cyan-400 w-6 h-6" />
        </motion.div>
      </div>

      {/* Main Content */}
      <header className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
        >
          BRAIN BYTE
        </motion.h1>
        <p className="text-gray-400 mt-4 uppercase tracking-widest text-sm font-bold">Select Your Challenge</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {games.map((game) => (
          <motion.div
            key={game.id}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => navigate(game.path)}
            className="cursor-pointer bg-[#11111a] border border-white/5 p-8 rounded-3xl transition-all hover:border-white/20 shadow-2xl group"
          >
            <div className="w-20 h-20 rounded-2xl mb-6 overflow-hidden border border-white/10 group-hover:border-cyan-500/50 transition-colors">
              <img src={game.img} alt={game.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold mb-1">{game.name}</h2>
            <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">Play for fun</p>
            <div className="text-xs font-bold text-cyan-400 group-hover:text-white transition-colors">PLAY NOW →</div>
          </motion.div>
        ))}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#11111a] border border-white/10 p-8 rounded-3xl max-w-md w-full relative shadow-2xl"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                <X size={24} />
              </button>
              
              <h2 className="text-3xl font-black mb-2 text-cyan-400">Join BrainByte</h2>
              <p className="text-gray-500 text-sm mb-6 font-medium">Create your unique gaming identity.</p>
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                  <input 
                    required type="text" 
                    placeholder="e.g. John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cyan-500 transition-colors text-white"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Faculty / Class</label>
                  <input 
                    required type="text" 
                    placeholder="e.g. CSIT"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cyan-500 transition-colors text-white"
                    onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Roll Number</label>
                  <input 
                    required type="number" 
                    placeholder="e.g. 45"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-cyan-500 transition-colors text-white"
                    onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#060614] font-black py-4 rounded-xl transition-all mt-4 uppercase tracking-widest shadow-lg shadow-cyan-500/20"
                >
                  Create Identity
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;