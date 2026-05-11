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
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database via Pool');
    
    // Create Ragdoll Stats Table if not exists
    const createRagdollTable = `
        CREATE TABLE IF NOT EXISTS ragdoll_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255),
            player_score INT,
            enemy_score INT,
            play_time VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            faculty_name VARCHAR(255) NOT NULL,
            roll_no VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createScoresTable = `
        CREATE TABLE IF NOT EXISTS scores (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            game_id VARCHAR(100) NOT NULL,
            score INT DEFAULT 0,
            play_time INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createRagdollTable, (err) => {
        if (err) console.error("Error creating ragdoll_stats table:", err);
        else console.log("ragdoll_stats table verified");
    });

    db.query(createUsersTable, (err) => {
        if (err) console.error("Error creating users table:", err);
        else console.log("users table verified");
    });

    db.query(createScoresTable, (err) => {
        if (err) console.error("Error creating scores table:", err);
        else console.log("scores table verified");
    });

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

// Ragdoll Specific Detailed Scores
app.post('/ragdoll-scores', (req, res) => {
    console.log("Saving Ragdoll Score:", req.body);
    const { username, playerScore, enemyScore, time } = req.body;
    const query = 'INSERT INTO ragdoll_stats (username, player_score, enemy_score, play_time) VALUES (?, ?, ?, ?)';
    
    db.query(query, [username, playerScore, enemyScore, time], (err, result) => {
        if (err) {
            console.error("Ragdoll Score Error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(200).json({ message: "Ragdoll score saved successfully!" });
    });
});

app.get('/ragdoll-scores/top', (req, res) => {
    const query = 'SELECT username, player_score, enemy_score, play_time, created_at FROM ragdoll_stats ORDER BY player_score DESC, play_time ASC LIMIT 12';
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.status(200).json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
