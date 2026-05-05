import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, GraduationCap, School, ArrowLeft } from 'lucide-react';

function App() {
  const [step, setStep] = useState('category'); // category, level, quiz
  const [category, setCategory] = useState(null);
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // AI API bata data tanne function (Frontend Only placeholder for now)
  const fetchAIQuestions = async (selectedLevel) => {
    setLoading(true);
    setStep('quiz');
    
    try {
      // Yaha pachi AI API ko URL halne (e.g. Gemini or OpenAI)
      console.log(`Fetching questions for ${selectedLevel}...`);
      
      // Placeholder data: Test garna ko lagi matra
      const mockData = [
        { q: "What is 2+2?", options: ["3", "4", "5"], ans: "4" },
        { q: "Capital of Nepal?", options: ["Kathmandu", "Pokhara", "Lalitpur"], ans: "Kathmandu" }
      ];
      setQuestions(mockData);
    } catch (err) {
      alert("API call fail vayo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
        
        {/* Step 1: Category Selection */}
        {step === 'category' && (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Select Education Level</h1>
            <div className="grid gap-4">
              <button 
                onClick={() => { setCategory('school'); fetchAIQuestions('School'); }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 transition"
              >
                <div className="flex items-center gap-3">
                  <School className="text-blue-500" /> <span>School Level</span>
                </div>
              </button>

              <button 
                onClick={() => setStep('level')}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-green-50 transition"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="text-green-500" /> <span>College Level</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: College Level Selection (+2 or Bachelor) */}
        {step === 'level' && (
          <div>
            <button onClick={() => setStep('category')} className="mb-4 flex items-center text-sm text-gray-500">
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">Choose Your Course</h2>
            <div className="grid gap-3">
              <button onClick={() => fetchAIQuestions('+2')} className="p-3 bg-indigo-600 text-white rounded-md">+2 Level</button>
              <button onClick={() => fetchAIQuestions('Bachelor')} className="p-3 bg-purple-600 text-white rounded-md">Bachelor Level</button>
            </div>
          </div>
        )}

        {/* Step 3: Quiz Display */}
        {step === 'quiz' && (
          <div className="text-center">
            {loading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            ) : (
              <div>
                <h2 className="text-lg font-bold mb-4 italic text-blue-600 underline">Quiz Started: {level}</h2>
                <div className="text-left bg-gray-50 p-4 rounded-lg">
                  {/* Question mapping yaha hunchha */}
                  <p className="font-medium text-gray-700">AI le questions pathauda yaha display hunchha...</p>
                </div>
                <button 
                  onClick={() => setStep('category')}
                  className="mt-6 text-red-500 text-sm font-semibold"
                >
                  Quit Quiz
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;