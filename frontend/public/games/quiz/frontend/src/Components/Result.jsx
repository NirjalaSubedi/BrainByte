import React from 'react';
import { Trophy } from 'lucide-react';

const Result = ({ score, total, onRestart }) => {
  return (
    <div className="text-center py-8">
      <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4 text-yellow-600">
        <Trophy size={48} />
      </div>
      <h2 className="text-3xl font-black text-gray-800">Quiz Completed!</h2>
      <p className="text-gray-500 mt-2 text-lg">Your score is</p>
      <div className="text-5xl font-black text-indigo-600 my-4">{score} / {total}</div>
      
      <button 
        onClick={onRestart}
        className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-lg"
      >
        Try Another Level
      </button>
    </div>
  );
};

export default Result;