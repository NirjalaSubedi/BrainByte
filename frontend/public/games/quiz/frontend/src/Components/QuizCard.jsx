import React from 'react';
import { ArrowLeft } from 'lucide-react';

const QuizCard = ({ question, total, current, onAnswer, onBack }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-red-500 transition">
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
          Question {current + 1} / {total}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-6">{question.q}</h3>

      <div className="space-y-3">
        {question.opt.map((option, index) => (
          <button 
            key={index}
            onClick={() => onAnswer(option)}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-indigo-600 hover:text-white transition-all font-medium"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizCard;