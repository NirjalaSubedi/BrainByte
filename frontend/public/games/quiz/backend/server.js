const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Demo quiz API (per-game backend)
app.get('/api/quiz', (req, res) => {
  const level = req.query.level || 'school';
  const collegeType = req.query.collegeType || null;

  const school = [
    { question: '2 + 2 = ?', options: ['3','4','5','6'], answer: 1 },
    { question: 'Nepal capital?', options: ['Kathmandu','Pokhara','Lalitpur','Dharan'], answer: 0 }
  ];
  const plus2 = [
    { question: 'Derivative of x^2?', options: ['x','2x','x^2','1'], answer: 1 },
    { question: 'Which is a noble gas?', options: ['O','N','He','H'], answer: 2 }
  ];
  const bachelors = [
    { question: 'HTTP stands for?', options: ['HyperText Transfer Protocol','Hyper Transfer Text Protocol','HyperText Transmission Protocol','Hyper Transfer Transmission Protocol'], answer: 0 },
    { question: 'FIFO structure?', options: ['Stack','Queue','Tree','Graph'], answer: 1 }
  ];

  let out = school;
  if(level === 'college') out = (collegeType === 'bachelors') ? bachelors : plus2;
  res.json(out);
});

// Serve static build if present
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (require('fs').existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

const port = process.env.PORT || 4001;
app.listen(port, () => console.log('Quiz backend running on', port));
