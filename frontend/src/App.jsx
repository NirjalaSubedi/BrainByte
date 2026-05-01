import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages Imports
import Dashboard from './pages/Dashboard';

// Temporary components for your 4 games
const FruitSlicerPlaceholder = () => (
  <div className="min-h-screen bg-[#060614] text-white flex flex-col items-center justify-center">
    <h1 className="text-5xl font-black text-orange-500 mb-4">Fruit Slicer</h1>
    <p className="text-gray-400 mb-8 font-medium">Game logic coming soon...</p>
    <a href="/" className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-full transition-all border border-white/10">Back to Dashboard</a>
  </div>
);

const SudokuPlaceholder = () => (
  <div className="min-h-screen bg-[#060614] text-white flex flex-col items-center justify-center">
    <h1 className="text-5xl font-black text-blue-400 mb-4">Sudoku</h1>
    <p className="text-gray-400 mb-8 font-medium">Game logic coming soon...</p>
    <a href="/" className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-full transition-all border border-white/10">Back to Dashboard</a>
  </div>
);

const RagdollPlaceholder = () => (
  <div className="min-h-screen bg-[#060614] text-white flex flex-col items-center justify-center">
    <h1 className="text-5xl font-black text-purple-500 mb-4">Ragdoll</h1>
    <p className="text-gray-400 mb-8 font-medium">Game logic coming soon...</p>
    <a href="/" className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-full transition-all border border-white/10">Back to Dashboard</a>
  </div>
);

const SpaceWavesPlaceholder = () => (
  <div className="min-h-screen bg-[#060614] text-white flex flex-col items-center justify-center">
    <h1 className="text-5xl font-black text-emerald-500 mb-4">Space Waves</h1>
    <p className="text-gray-400 mb-8 font-medium">Game logic coming soon...</p>
    <a href="/" className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-full transition-all border border-white/10">Back to Dashboard</a>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Dashboard Route */}
        <Route path="/" element={<Dashboard />} />

        {/* Game Routes mapped to the 4 folders in your BrainByte project */}
        <Route path="/fruit-slicer" element={<FruitSlicerPlaceholder />} />
        <Route path="/sudoku" element={<SudokuPlaceholder />} />
        <Route path="/ragdoll" element={<RagdollPlaceholder />} />
        <Route path="/spacewaves" element={<SpaceWavesPlaceholder />} />

        {/* Catch-all to prevent 404s during development */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;