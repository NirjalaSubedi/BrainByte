import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { RefreshCw, Sparkles, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

const BOARD_SIZE = 9;
const BOX_SIZE = 3;
const MAX_WRONG_ATTEMPTS = 3;

function App() {
	const [board, setBoard] = useState([]);
	const [solution, setSolution] = useState([]);
	const [fixed, setFixed] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [clues, setClues] = useState(34);
	const [seconds, setSeconds] = useState(0);
	const [wrongAttempts, setWrongAttempts] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [scoreData, setScoreData] = useState(null);
	const [showOutPopup, setShowOutPopup] = useState(false);
	const [scoring, setScoring] = useState(false);

	const apiBase = import.meta.env.VITE_API_URL || '/api';

	const isSolved = useMemo(() => {
		if (board.length !== BOARD_SIZE || solution.length !== BOARD_SIZE) {
			return false;
		}

		for (let row = 0; row < BOARD_SIZE; row += 1) {
			for (let col = 0; col < BOARD_SIZE; col += 1) {
				if (board[row][col] !== solution[row][col]) {
					return false;
				}
			}
		}

		return true;
	}, [board, solution]);

	useEffect(() => {
		if (board.length === 0 || isSolved || gameOver) {
			return undefined;
		}

		const timer = setInterval(() => {
			setSeconds((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [board, gameOver, isSolved]);

	useEffect(() => {
		if (!isSolved) {
			return;
		}

		confetti({
			particleCount: 140,
			spread: 85,
			origin: { y: 0.6 },
		});
	}, [isSolved]);

	const fetchPuzzle = async (nextClues = clues) => {
		setLoading(true);
		setError('');

		try {
			const response = await fetch(`${apiBase}/sudoku/new?clues=${nextClues}`);
			if (!response.ok) {
				throw new Error('Failed to get puzzle from server');
			}

			const data = await response.json();
			setBoard(data.puzzle);
			setSolution(data.solution);
			setFixed(data.fixed);
			setSeconds(0);
			setWrongAttempts(0);
			setGameOver(false);
			setShowOutPopup(false);
		} catch (err) {
			setError(err.message || 'Unable to load puzzle right now.');
		} finally {
			setLoading(false);
		}
	};

	const fetchScore = async (status) => {
		const response = await fetch(`${apiBase}/sudoku/score`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				seconds,
				clues,
				wrongAttempts,
				maxWrongAttempts: MAX_WRONG_ATTEMPTS,
				status,
			}),
		});

		if (!response.ok) {
			throw new Error('Could not calculate score');
		}

		return response.json();
	};

	useEffect(() => {
		fetchPuzzle(clues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!gameOver) {
			return;
		}

		let isCancelled = false;

		const loadScore = async () => {
			setScoring(true);
			try {
				const data = await fetchScore('timeout');
				if (!isCancelled) {
					setScoreData(data);
					setShowOutPopup(true);
				}
			} catch (err) {
				if (!isCancelled) {
					setScoreData({ score: 0, message: err.message || 'Score unavailable' });
					setShowOutPopup(true);
				}
			} finally {
				if (!isCancelled) {
					setScoring(false);
				}
			}
		};

		loadScore();

		return () => {
			isCancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameOver]);

	const onInputChange = (row, col, value) => {
		if (fixed[row][col] || isSolved || gameOver) {
			return;
		}

		if (value !== '' && !/^[1-9]$/.test(value)) {
			return;
		}

		const nextValue = value === '' ? 0 : Number.parseInt(value, 10);
		const expectedValue = solution[row]?.[col];

		if (nextValue !== 0 && expectedValue && nextValue !== expectedValue) {
			setWrongAttempts((prev) => {
				const nextAttempts = prev + 1;
				if (nextAttempts >= MAX_WRONG_ATTEMPTS) {
					setGameOver(true);
				}
				return nextAttempts;
			});
		}

		const nextBoard = board.map((line, rowIndex) =>
			line.map((cell, colIndex) => {
				if (rowIndex === row && colIndex === col) {
					return nextValue;
				}
				return cell;
			}),
		);

		setBoard(nextBoard);
	};

	const isWrongCell = (row, col) => {
		const current = board[row]?.[col];
		if (!current || fixed[row][col]) {
			return false;
		}
		return solution[row][col] !== current;
	};

	const formatTime = (totalSeconds) => {
		const mins = Math.floor(totalSeconds / 60)
			.toString()
			.padStart(2, '0');
		const secs = (totalSeconds % 60).toString().padStart(2, '0');
		return `${mins}:${secs}`;
	};

	const closePopup = () => {
		setShowOutPopup(false);
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef2ff,#f8fafc_55%,#dbeafe)] p-4 text-slate-900 md:p-8">
			<motion.div
				initial={{ opacity: 0, y: 28 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="mx-auto w-full max-w-5xl"
			>
				<section className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_24px_90px_-40px_rgba(14,116,144,0.6)] backdrop-blur-xl">
					<div className="grid gap-6 p-6 md:grid-cols-[1fr_auto_auto] md:items-center md:p-8">
						<p className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
							<Sparkles className="h-4 w-4" />
							BrainByte Sudoku
						</p>

						<div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white px-4 py-3">
							<Timer className="h-5 w-5 text-cyan-600" />
							<div>
								<p className="text-xs font-medium uppercase tracking-wider text-slate-500">Time</p>
								<p className="font-display text-2xl font-bold text-slate-900">{formatTime(seconds)}</p>
							</div>
						</div>

						<div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3">
							<p className="text-xs font-medium uppercase tracking-wider text-slate-500">Last Score</p>
							<p className="font-display text-2xl font-bold text-emerald-700">{scoreData?.score ?? '--'}</p>
						</div>
					</div>

					<div className="border-t border-slate-200/70 p-6 md:p-10">
						<div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<div className="flex items-center gap-3">
								<label htmlFor="clues" className="text-sm font-semibold text-slate-700">
									Difficulty (clues)
								</label>
								<input
									id="clues"
									type="range"
									min="25"
									max="50"
									value={clues}
									onChange={(e) => setClues(Number.parseInt(e.target.value, 10))}
									className="accent-cyan-600"
								/>
								<span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
									{clues}
								</span>
								<span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">
									Wrong: {wrongAttempts}/{MAX_WRONG_ATTEMPTS}
								</span>
							</div>

							<button
								type="button"
								onClick={() => fetchPuzzle(clues)}
								disabled={loading}
								className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
							>
								<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
								{loading ? 'Loading...' : 'Refresh Puzzle'}
							</button>
						</div>

						{error && (
							<p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
								{error}
							</p>
						)}

						<div className="mx-auto w-fit rounded-2xl border border-slate-300 bg-white p-2 shadow-md md:p-3">
							<div className="grid grid-cols-9">
								{board.map((row, rowIdx) =>
									row.map((cell, colIdx) => {
										const thickRight = (colIdx + 1) % BOX_SIZE === 0 && colIdx !== BOARD_SIZE - 1;
										const thickBottom = (rowIdx + 1) % BOX_SIZE === 0 && rowIdx !== BOARD_SIZE - 1;
										const fixedCell = fixed[rowIdx][colIdx];
										const wrongCell = isWrongCell(rowIdx, colIdx);

										return (
											<input
												key={`${rowIdx}-${colIdx}`}
												type="text"
												value={cell === 0 ? '' : cell}
												maxLength={1}
												onChange={(e) => onInputChange(rowIdx, colIdx, e.target.value)}
												readOnly={fixedCell || loading || gameOver}
												className={`
													h-10 w-10 border border-slate-300 text-center font-display text-lg font-bold outline-none transition
													md:h-14 md:w-14 md:text-2xl
													${thickRight ? 'border-r-4 border-r-slate-700' : ''}
													${thickBottom ? 'border-b-4 border-b-slate-700' : ''}
													${fixedCell ? 'bg-slate-100 text-slate-700' : 'bg-white text-cyan-800 focus:bg-cyan-50'}
													${wrongCell ? 'bg-rose-50 text-rose-600' : ''}
												`}
											/>
										);
									}),
								)}
							</div>
						</div>

						{isSolved && (
							<motion.p
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								className="mx-auto mt-6 w-fit rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
							>
								Great job! Sudoku solved in {formatTime(seconds)}.
							</motion.p>
						)}
					</div>
				</section>
			</motion.div>

			{showOutPopup && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl"
					>
						<h2 className="font-display text-2xl font-extrabold text-rose-700">Time Out</h2>
						<p className="mt-2 text-sm text-slate-600">
							3 wrong entries पुगेकोले तपाईं out हुनुभयो।
						</p>

						<div className="mt-5 grid grid-cols-2 gap-3">
							<div className="rounded-xl bg-slate-50 p-3">
								<p className="text-xs uppercase tracking-wider text-slate-500">Timeout At</p>
								<p className="font-display text-xl font-bold text-slate-900">{formatTime(seconds)}</p>
							</div>
							<div className="rounded-xl bg-emerald-50 p-3">
								<p className="text-xs uppercase tracking-wider text-emerald-700">Score</p>
								<p className="font-display text-xl font-bold text-emerald-700">
									{scoring ? '...' : scoreData?.score ?? 0}
								</p>
							</div>
						</div>

						<p className="mt-4 text-xs text-slate-500">{scoreData?.message || ''}</p>

						<div className="mt-6 flex gap-3">
							<button
								type="button"
								onClick={() => {
									closePopup();
									fetchPuzzle(clues);
								}}
								className="flex-1 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-700"
							>
								New Puzzle
							</button>
							<button
								type="button"
								onClick={closePopup}
								className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
							>
								Close
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</div>
	);
}

export default App;
