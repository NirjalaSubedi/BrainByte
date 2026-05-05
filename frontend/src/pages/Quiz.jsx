import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, GraduationCap, School, Trophy } from 'lucide-react';

const GEMINI_API_KEY = 'AIzaSyA3JgVQpZVFQO5tlg-plW7tsAnXjqkOWwM';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const BACKEND_URL = 'http://localhost:5000';
const GAME_ID = 'quiz';
const TARGET_QUESTION_COUNT = 25;
const QUESTION_TIME_LIMIT = 15;
const ANSWER_REVEAL_DELAY_MS = 3000;

const levels = [
  { key: 'School', label: 'School Level', icon: School },
  { key: 'PlusTwo', label: '+2 (High School)', icon: GraduationCap },
  { key: 'Bachelor', label: 'Bachelor Level', icon: Trophy },
];

const fallbackQuestions = {
  School: [
    { q: 'Which planet do we live on?', opt: ['Mars', 'Earth', 'Jupiter', 'Venus'], ans: 'Earth' },
    { q: 'How many days are there in a week?', opt: ['5', '6', '7', '8'], ans: '7' },
    { q: 'What color is the sky on a clear day?', opt: ['Blue', 'Red', 'Green', 'Black'], ans: 'Blue' },
    { q: 'What is 2 + 2?', opt: ['3', '4', '5', '6'], ans: '4' },
    { q: 'Which animal barks?', opt: ['Cat', 'Cow', 'Dog', 'Fish'], ans: 'Dog' },
  ],
  PlusTwo: [
    { q: 'What is the SI unit of force?', opt: ['Joule', 'Newton', 'Watt', 'Pascal'], ans: 'Newton' },
    { q: 'Which gas is most abundant in Earth’s atmosphere?', opt: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], ans: 'Nitrogen' },
    { q: 'What is the square root of 144?', opt: ['10', '11', '12', '13'], ans: '12' },
    { q: 'Which organ pumps blood?', opt: ['Liver', 'Heart', 'Lung', 'Kidney'], ans: 'Heart' },
    { q: 'What is the capital of Nepal?', opt: ['Pokhara', 'Biratnagar', 'Lalitpur', 'Kathmandu'], ans: 'Kathmandu' },
  ],
  Bachelor: [
    { q: 'Which data structure uses FIFO?', opt: ['Stack', 'Queue', 'Tree', 'Graph'], ans: 'Queue' },
    { q: 'What does CPU stand for?', opt: ['Central Processing Unit', 'Computer Personal Unit', 'Control Program Unit', 'Central Print Unit'], ans: 'Central Processing Unit' },
    { q: 'Which algorithm is used for shortest path in weighted graphs?', opt: ['DFS', 'BFS', 'Dijkstra', 'Prim'], ans: 'Dijkstra' },
    { q: 'What is the derivative of x^2?', opt: ['x', '2x', 'x^2', '2'], ans: '2x' },
    { q: 'Which protocol is used to secure web traffic?', opt: ['HTTP', 'FTP', 'SMTP', 'HTTPS'], ans: 'HTTPS' },
  ],
};

const getFallbackQuestions = (selectedLevel) => fallbackQuestions[selectedLevel] || fallbackQuestions.School;
const getLevelNumber = (selectedLevel) => {
  if (selectedLevel === 'School') return 1;
  if (selectedLevel === 'PlusTwo') return 2;
  if (selectedLevel === 'Bachelor') return 3;
  return 1;
};

const normalizeQuestions = (questions, selectedLevel) => {
  const sourceQuestions = Array.isArray(questions) && questions.length > 0 ? questions : getFallbackQuestions(selectedLevel);
  const normalized = [...sourceQuestions];

  while (normalized.length < TARGET_QUESTION_COUNT) {
    normalized.push(sourceQuestions[normalized.length % sourceQuestions.length]);
  }

  return normalized.slice(0, TARGET_QUESTION_COUNT);
};

const Quiz = () => {
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [savingScore, setSavingScore] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/scores/${GAME_ID}/top?limit=3`);
        setLeaderboard(response.data || []);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      }
    };

    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (!level || loading || showResult || questions.length === 0 || answerLocked) {
      return undefined;
    }

    setTimeLeft(QUESTION_TIME_LIMIT);

    const timerId = window.setInterval(() => {
      setTimeLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [currentQuestion, level, loading, showResult, questions.length, answerLocked]);

  const advanceQuestion = (nextScore) => {
    const nextQuestionIndex = currentQuestion + 1;

    if (nextQuestionIndex < questions.length) {
      setCurrentQuestion(nextQuestionIndex);
      setSelectedAnswer(null);
      setAnswerLocked(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
      return;
    }

    setShowResult(true);
    saveScore(nextScore, getLevelNumber(level));
  };

  const saveScore = async (finalScore, finalLevel) => {
    const username = localStorage.getItem('brainbyte_user');

    if (!username) {
      setSaveMessage('Login to save your score on the leaderboard.');
      return;
    }

    try {
      setSavingScore(true);
      setSaveMessage('');

      await axios.post(`${BACKEND_URL}/add-score`, {
        username,
        game_id: GAME_ID,
        score: finalScore,
        level: finalLevel,
      });

      const response = await axios.get(`${BACKEND_URL}/scores/${GAME_ID}/top?limit=3`);
      setLeaderboard(response.data || []);
      setSaveMessage('Score saved to leaderboard.');
    } catch (error) {
      console.error('Error saving score:', error);
      setSaveMessage('Could not save your score right now.');
    } finally {
      setSavingScore(false);
    }
  };

  const fetchAIQuestions = async (selectedLevel) => {
    setLoading(true);
    setLevel(selectedLevel);
    setSelectedAnswer(null);
    setAnswerLocked(false);
    setTimeLeft(QUESTION_TIME_LIMIT);

    const prompt = `Generate ${TARGET_QUESTION_COUNT} multiple choice questions for a ${selectedLevel} level student. Return the response strictly in JSON format as an array of objects. Each object must have: "q" (question string), "opt" (array of 4 strings), and "ans" (the exact correct string from opt array). Example: [{"q": "Question?", "opt": ["A", "B", "C", "D"], "ans": "A"}]`;

    try {
      const response = await axios.post(API_URL, {
        contents: [{ parts: [{ text: prompt }] }],
      });

      const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Empty response from Gemini API');
      }

      const cleanJson = JSON.parse(rawText.replace(/```json|```/g, '').trim());

      setQuestions(normalizeQuestions(cleanJson, selectedLevel));
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setSaveMessage('');
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions(normalizeQuestions(getFallbackQuestions(selectedLevel), selectedLevel));
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setSaveMessage('AI failed, so fallback questions were loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selected) => {
    if (answerLocked || showResult) return;

    setSelectedAnswer(selected);
    setAnswerLocked(true);

    const isCorrect = selected === questions[currentQuestion].ans;
    const nextScore = isCorrect ? score + 1 : score;

    setScore(nextScore);

    setTimeout(() => {
      advanceQuestion(nextScore);
    }, ANSWER_REVEAL_DELAY_MS);
  };

  const handleTimeout = () => {
    if (answerLocked || showResult) return;

    setAnswerLocked(true);
    setSelectedAnswer(null);

    setTimeout(() => {
      advanceQuestion(score);
    }, ANSWER_REVEAL_DELAY_MS);
  };

  useEffect(() => {
    if (timeLeft !== 0) return undefined;
    if (!level || loading || showResult || questions.length === 0 || answerLocked) return undefined;

    handleTimeout();
    return undefined;
  }, [timeLeft, level, loading, showResult, questions.length, answerLocked]);

  const handleBack = () => {
    setLevel(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswerLocked(false);
    setSaveMessage('');
    setTimeLeft(QUESTION_TIME_LIMIT);
  };

  return (
    <main className="min-h-screen bg-[#060614] text-white p-6 md:p-10">
      <div className="mx-auto w-full max-w-3xl rounded-4xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-cyan-400 transition-colors">
            <ArrowLeft size={18} /> Back to Dashboard
          </a>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-400">Quiz</p>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
            Quiz Master
          </h1>
          <p className="mt-3 text-gray-400 uppercase tracking-widest text-xs font-bold">Select Your Challenge</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400" />
            <p className="text-gray-300 font-medium">AI is generating questions...</p>
          </div>
        ) : !level ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {levels.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => fetchAIQuestions(item.key)}
                    className="rounded-3xl border border-white/10 bg-[#11111a] p-5 text-left transition-all hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-white/10"
                  >
                    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                      <Icon size={28} />
                    </div>
                    <h2 className="text-xl font-bold text-white">{item.label}</h2>
                    <p className="mt-2 text-sm text-gray-400">Start a new quiz at this level.</p>
                  </button>
                );
              })}
            </div>

            <section className="rounded-3xl border border-white/10 bg-[#11111a] p-6 md:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-lg font-black text-white">Top 3 Players</h2>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">Leaderboard</span>
              </div>

              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={`${entry.username}-${index}`}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                        index === 0 ? 'border-emerald-400/30 bg-emerald-400/10' : index === 1 ? 'border-slate-300/20 bg-white/5' : 'border-orange-400/20 bg-orange-400/10'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-white">#{index + 1} {entry.username}</p>
                        <p className="text-xs text-gray-400">Level {entry.level || 1} • {entry.total_plays || 0} plays</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-cyan-400">{entry.best_score ?? 0}</p>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Best Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No scores yet. Be the first one on the board.</p>
              )}
            </section>
          </div>
        ) : questions.length > 0 && !showResult ? (
          <section className="rounded-3xl border border-white/10 bg-[#11111a] p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-400 transition-colors">
                <ArrowLeft size={18} /> Change Level
              </button>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400">
                  Question {currentQuestion + 1} / {questions.length}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${timeLeft <= 5 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                  {timeLeft}s left
                </span>
              </div>
            </div>

            <h3 className="mb-6 text-2xl font-bold text-white">{questions[currentQuestion].q}</h3>

            <div className="grid gap-3">
              {questions[currentQuestion].opt.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full rounded-2xl border p-4 text-left font-medium transition-all ${
                    answerLocked
                      ? option === questions[currentQuestion].ans
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                        : option === selectedAnswer
                          ? 'border-red-400 bg-red-500/20 text-red-200'
                          : 'border-white/10 bg-white/5 text-gray-400 opacity-80'
                      : 'border-white/10 bg-white/5 text-gray-200 hover:border-cyan-500/50 hover:bg-cyan-500 hover:text-[#060614]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-white/10 bg-[#11111a] p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
              <Trophy size={42} />
            </div>
            <h2 className="text-3xl font-black text-white">Quiz Completed!</h2>
            <p className="mt-3 text-gray-400">Your score is</p>
            <div className="my-5 text-5xl font-black text-cyan-400">
              {score} / {questions.length}
            </div>
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-[#060614] transition-colors hover:bg-cyan-400"
            >
              Try Another Level
            </button>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-gray-300">
              <p className="font-bold text-white">Saved score status</p>
              <p className="mt-1">{savingScore ? 'Saving your score...' : saveMessage || 'Score will be saved automatically for logged-in users.'}</p>
            </div>
          </section>
        )}

        {level && showResult && leaderboard.length > 0 && (
          <section className="mt-6 rounded-3xl border border-white/10 bg-[#11111a] p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-black text-white">Top 3 Players</h2>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">Leaderboard</span>
            </div>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div key={`${entry.username}-${index}-result`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-bold text-white">#{index + 1} {entry.username}</p>
                    <p className="text-xs text-gray-400">Level {entry.level || 1}</p>
                  </div>
                  <p className="text-lg font-black text-cyan-400">{entry.best_score ?? 0}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Quiz;
