const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Default XAMPP user
    password: '', // Default XAMPP password
    database: 'brainbyte'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database: brainbyte');
});

<<<<<<< HEAD
// Simple Quiz API: returns sample questions based on level and collegeType
app.get('/api/quiz', (req, res) => {
    const level = req.query.level || 'school';
    const collegeType = req.query.collegeType || null;

    // Example question sets (for demo). Replace with DB-driven questions later.
    const schoolQs = [
        { question: 'What is 2 + 2?', options: ['3','4','5','6'], answer: 1 },
        { question: 'Capital of Nepal?', options: ['Kathmandu','Pokhara','Lalitpur','Bhaktapur'], answer: 0 }
    ];
    const plus2Qs = [
        { question: 'Which is a noble gas?', options: ['Oxygen','Nitrogen','Helium','Hydrogen'], answer: 2 },
        { question: 'Derivative of x^2 is?', options: ['x','2x','x^2','2'], answer: 1 }
    ];
    const bachelorsQs = [
        { question: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol','Hyperlink Transfer Text Protocol','HyperText Transmission Protocol','Hyperlink Transmission Protocol'], answer: 0 },
        { question: 'Which data structure uses FIFO?', options: ['Stack','Queue','Tree','Graph'], answer: 1 }
    ];

    let out = schoolQs;
    if (level === 'college') {
        out = collegeType === 'bachelors' ? bachelorsQs : plus2Qs;
    }

    // Return as many as needed; for now return full array
    res.json(out);
});

// Debug: list registered routes
app.get('/_routes', (req, res) => {
    const routes = [];
    if (app && app._router && app._router.stack) {
        app._router.stack.forEach(mw => {
            if (mw.route && mw.route.path) {
                const methods = Object.keys(mw.route.methods).join(',');
                routes.push({ path: mw.route.path, methods });
            }
        });
    }
    res.json(routes);
});

// 1. Registration Route (Check before insert)
=======
>>>>>>> origin/feature/optimized-gestures
app.post('/add-user', (req, res) => {
    const { username, faculty_name, roll_no } = req.body;
    const query = 'INSERT INTO users (username, faculty_name, roll_no) VALUES (?, ?, ?)';
    
    db.query(query, [username, faculty_name, roll_no], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "User already exists!" });
            }
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(200).json({ message: "User added successfully!" });
    });
});

app.post('/login', (req, res) => {
    const { username } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    
    db.query(query, [username], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (results.length > 0) {
            res.status(200).json({ message: "Login successful", user: results[0] });
        } else {
            res.status(404).json({ message: "User not found!" });
        }
    });
});

// Dummy endpoints for game scores to prevent frontend errors
app.get('/scores/:gameId/top', (req, res) => {
    res.status(200).json([]);
});

app.post('/scores', (req, res) => {
    res.status(200).json({ message: "Score received" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
