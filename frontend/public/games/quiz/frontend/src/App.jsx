import React, { useState } from 'react';
import axios from 'axios';
import LevelSelector from './components/LevelSelector';
import QuizCard from './components/QuizCard';
import Result from './components/Result';

const GEMINI_API_KEY = 'AIzaSyA3JgVQpZVFQO5tlg-plW7tsAnXjqkOWwM';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function App() {
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAIQuestions = async (selectedLevel) => {
    setLoading(true);
    setLevel(selectedLevel);

    const prompt = `Generate 5 multiple choice questions for a ${selectedLevel} level student. 
    Return the response strictly in JSON format as an array of objects. 
    Each object must have: "q" (question string), "opt" (array of 4 strings), and "ans" (the exact correct string from opt array).
    Example: [{"q": "Question?", "opt": ["A", "B", "C", "D"], "ans": "A"}]`;

    try {
      const response = await axios.post(API_URL, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      const rawText = response.data.candidates[0].content.parts[0].text;
      const cleanJson = JSON.parse(rawText.replace(/```json|```/g, ''));

      setQuestions(cleanJson);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('AI API error! Level select garda feri try garnu.');
      setLevel(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selected) => {
    if (selected === questions[currentQuestion].ans) setScore(score + 1);

    const next = currentQuestion + 1;
    if (next < questions.length) setCurrentQuestion(next);
    else setShowResult(true);
  };

  const handleRestart = () => {
    setLevel(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-black uppercase tracking-tighter">AI Quiz Master</h1>
          {level && <p className="text-xs opacity-70 mt-1 uppercase">Level: {level}</p>}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium italic">AI is generating real questions...</p>
            </div>
          ) : (
            <>
              {!level && <LevelSelector onSelect={fetchAIQuestions} />}

              {level && questions.length > 0 && !showResult && (
                <QuizCard
                  question={questions[currentQuestion]}
                  total={questions.length}
                  current={currentQuestion}
                  onAnswer={handleAnswer}
                  onBack={handleRestart}
                />
              )}

              {showResult && (
                <Result
                  score={score}
                  total={questions.length}
                  onRestart={handleRestart}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
