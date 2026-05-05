import React from 'react';
import { School, GraduationCap, Trophy } from 'lucide-react';

const LevelSelector = ({ onSelect }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 text-center mb-6">Select Your Level</h2>
      <button onClick={() => onSelect('School')} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition font-bold text-gray-600">
        <School className="text-orange-500" /> School Level
      </button>
      <button onClick={() => onSelect('PlusTwo')} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition font-bold text-gray-600">
        <GraduationCap className="text-blue-500" /> +2 (High School)
      </button>
      <button onClick={() => onSelect('Bachelor')} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition font-bold text-gray-600">
        <Trophy className="text-purple-500" /> Bachelor Level
      </button>
    </div>
  );
};

export default LevelSelector;