require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection Pool (Better for production)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST !== 'localhost' ? {
        rejectUnauthorized: false
    } : null,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database via Pool');
    connection.release();
});

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

// Save game score
app.post('/scores', (req, res) => {
    const { username, gameId, score, time } = req.body;
    const query = 'INSERT INTO scores (username, game_id, score, play_time) VALUES (?, ?, ?, ?)';
    
    db.query(query, [username, gameId, score, time], (err, result) => {
        if (err) {
            console.error("Score Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(200).json({ message: "Score saved successfully!" });
    });
});

// Get top scores for a game
app.get('/scores/:gameId/top', (req, res) => {
    const { gameId } = req.params;
    const query = 'SELECT username, score, play_time, created_at FROM scores WHERE game_id = ? ORDER BY score DESC LIMIT 10';
    
    db.query(query, [gameId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.status(200).json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
