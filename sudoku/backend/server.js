import cors from 'cors';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function createEmptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function isValid(grid, row, col, value) {
  for (let i = 0; i < 9; i += 1) {
    if (grid[row][i] === value || grid[i][col] === value) {
      return false;
    }
  }

  const boxRowStart = Math.floor(row / 3) * 3;
  const boxColStart = Math.floor(col / 3) * 3;

  for (let r = boxRowStart; r < boxRowStart + 3; r += 1) {
    for (let c = boxColStart; c < boxColStart + 3; c += 1) {
      if (grid[r][c] === value) {
        return false;
      }
    }
  }

  return true;
}

function fillGrid(grid) {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (grid[row][col] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const number of numbers) {
          if (isValid(grid, row, col, number)) {
            grid[row][col] = number;
            if (fillGrid(grid)) {
              return true;
            }
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSolvedGrid() {
  const grid = createEmptyGrid();
  fillGrid(grid);
  return grid;
}

function createPuzzleFromSolution(solution, clues = 34) {
  const puzzle = cloneGrid(solution);
  const allPositions = [];

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      allPositions.push([row, col]);
    }
  }

  shuffle(allPositions);
  const cellsToRemove = 81 - clues;

  for (let i = 0; i < cellsToRemove; i += 1) {
    const [row, col] = allPositions[i];
    puzzle[row][col] = 0;
  }

  return puzzle;
}

function getFixedMask(puzzle) {
  return puzzle.map((row) => row.map((cell) => cell !== 0));
}

function calculateScore({
  seconds = 0,
  clues = 34,
  wrongAttempts = 0,
  maxWrongAttempts = 3,
  status = 'playing',
}) {
  const safeSeconds = Math.max(0, Number.parseInt(seconds, 10) || 0);
  const safeClues = clamp(Number.parseInt(clues, 10) || 34, 25, 50);
  const safeWrongAttempts = clamp(Number.parseInt(wrongAttempts, 10) || 0, 0, 20);
  const safeMaxWrong = clamp(Number.parseInt(maxWrongAttempts, 10) || 3, 1, 10);

  const difficultyBonus = Math.round((50 - safeClues) * 8);
  const timeBonus = Math.max(0, 600 - safeSeconds) * 2;
  const wrongPenalty = safeWrongAttempts * 120;
  const strikePenalty = Math.max(0, safeWrongAttempts - safeMaxWrong) * 80;

  const multiplierByStatus = {
    solved: 1.2,
    timeout: 0.45,
    playing: 0.85,
  };
  const statusMultiplier = multiplierByStatus[status] || multiplierByStatus.playing;

  const baseScore = 800 + difficultyBonus + timeBonus - wrongPenalty - strikePenalty;
  const score = Math.max(0, Math.round(baseScore * statusMultiplier));

  return {
    score,
    message:
      status === 'timeout'
        ? 'Timeout भएकोले score penalty apply गरिएको छ।'
        : 'Score सफलतापूर्वक calculate भयो।',
    breakdown: {
      status,
      seconds: safeSeconds,
      clues: safeClues,
      wrongAttempts: safeWrongAttempts,
      difficultyBonus,
      timeBonus,
      wrongPenalty,
      strikePenalty,
      statusMultiplier,
    },
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/sudoku/new', (req, res) => {
  const cluesQuery = Number.parseInt(req.query.clues, 10);
  const clues = Number.isNaN(cluesQuery) ? 34 : Math.min(50, Math.max(25, cluesQuery));

  const solution = generateSolvedGrid();
  const puzzle = createPuzzleFromSolution(solution, clues);
  const fixed = getFixedMask(puzzle);

  res.json({ puzzle, solution, fixed, clues });
});

app.post('/api/sudoku/score', (req, res) => {
  const result = calculateScore(req.body || {});
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Sudoku backend running on http://localhost:${PORT}`);
});
