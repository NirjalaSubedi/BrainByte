import { useState, useEffect, useRef } from 'react';
import { initialIcons } from './data/icons';
import Grid from './components/Grid'; // Grid import gareko

export default function App() {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [revealAll, setRevealAll] = useState(true);
  const [finalScore, setFinalScore] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [savingScore, setSavingScore] = useState(false);
  const [scoreError, setScoreError] = useState('');
  const [completed, setCompleted] = useState(false);
  const revealTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const savedScoreRef = useRef(false);

  const startRevealTimer = () => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
    }

    setRevealAll(true);
    revealTimerRef.current = setTimeout(() => {
      setRevealAll(false);
      revealTimerRef.current = null;
    }, 5000);
  };

  const getUsername = () => {
    return localStorage.getItem('brainbyte_user') || 'guest';
  };

  const calculateScore = (movesTaken, elapsedSeconds) => {
    const rawScore = 1000 - (movesTaken * 40) - (elapsedSeconds * 5);
    return Math.max(0, rawScore);
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/scores/memory-match/top?limit=5');
      if (!response.ok) return;
      const rows = await response.json();
      setLeaderboard(Array.isArray(rows) ? rows : []);
    } catch (error) {
      setLeaderboard([]);
    }
  };

  const saveScore = async (scoreValue, elapsedSeconds) => {
    if (savedScoreRef.current) return;
    savedScoreRef.current = true;
    setSavingScore(true);
    setScoreError('');
    setFinalScore(scoreValue);
    setTotalTime(elapsedSeconds);

    try {
      const username = getUsername();
      const response = await fetch('http://localhost:5000/add-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          game_id: 'memory-match',
          score: scoreValue,
          level: 1,
          outLevel: 1,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Score save failed');
      }

      await loadLeaderboard();
    } catch (error) {
      setScoreError(error.message || 'Unable to save score');
      savedScoreRef.current = false;
    } finally {
      setSavingScore(false);
    }
  };

  const setupGame = () => {
    const duplicatedIcons = [...initialIcons, ...initialIcons]
      .map((item, index) => ({ ...item, id: index }))
      .sort(() => Math.random() - 0.5);
    
    setCards(duplicatedIcons);
    setMatchedCards([]);
    setFlippedCards([]);
    setMoves(0);
    setFinalScore(null);
    setTotalTime(0);
    setLeaderboard([]);
    setScoreError('');
    setCompleted(false);
    savedScoreRef.current = false;
    startTimeRef.current = Date.now();
    startRevealTimer();
  };

  useEffect(() => {
    setupGame();

    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!cards.length || completed) return;

    const allMatched = matchedCards.length === initialIcons.length;
    if (!allMatched) return;

    const elapsedSeconds = Math.max(1, Math.ceil((Date.now() - (startTimeRef.current || Date.now())) / 1000));
    const scoreValue = calculateScore(moves, elapsedSeconds);
    setCompleted(true);
    saveScore(scoreValue, elapsedSeconds);
  }, [matchedCards, cards.length, completed, moves]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const handleCardClick = (card) => {
    if (revealAll || flippedCards.length === 2 || completed) return;
    
    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (newFlipped[0].name === newFlipped[1].name) {
        setMatchedCards(prev => [...prev, newFlipped[0].name]);
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-2">Memory Match</h1>
      <p className="text-orange-400 font-medium mb-6">Total Moves: {moves}</p>
      
      {/* Aba Grid component yahan use bhayo */}
      <Grid 
        cards={cards}
        flippedCards={flippedCards}
        matchedCards={matchedCards}
        revealAll={revealAll}
        onCardClick={handleCardClick}
      />

      {completed && (
        <div className="mt-6 w-full max-w-2xl rounded-3xl border border-orange-500/20 bg-white/5 p-6 text-center shadow-2xl">
          <p className="text-orange-400 text-xs font-bold uppercase tracking-[0.35em] mb-3">Game Complete</p>
          <h2 className="text-3xl font-black text-white mb-2">Your Score: {finalScore ?? 0}</h2>
          <p className="text-gray-300 mb-1">Moves: {moves}</p>
          <p className="text-gray-300 mb-4">Time: {totalTime}s</p>
          {savingScore && <p className="text-orange-300 text-sm">Saving score to database...</p>}
          {scoreError && <p className="text-red-400 text-sm">{scoreError}</p>}
        </div>
      )}

      <button 
        onClick={setupGame}
        className="mt-8 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold shadow-lg transition-transform active:scale-95"
      >
        New Game
      </button>

      <section className="mt-8 w-full max-w-2xl rounded-3xl border border-orange-500/20 bg-white/5 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-white">Top Scores</h3>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Memory Match</p>
        </div>
        <div className="space-y-3">
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <div key={`${entry.username}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-800/70 px-4 py-3 text-sm border border-orange-500/10">
                <div>
                  <p className="font-semibold text-white">{index + 1}. {entry.username}</p>
                  <p className="text-gray-400">Plays: {entry.total_plays}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-400">{entry.best_score}</p>
                  <p className="text-gray-400">Best</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No scores yet. Finish a game to see the leaderboard.</p>
          )}
        </div>
      </section>
    </div>
  );
}