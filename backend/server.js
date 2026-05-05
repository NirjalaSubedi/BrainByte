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
