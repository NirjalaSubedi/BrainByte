const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "brainbyte"
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL Database!');
});

// 1. Registration Route (Check before insert)
app.post('/add-user', (req, res) => {
    const { username, faculty_name, roll_no } = req.body;
    
    // Pahila check garne: yo username exist garchha?
    const checkSql = "SELECT * FROM users WHERE username = ?";
    db.query(checkSql, [username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length > 0) {
            return res.status(400).json({ message: "Username already exists!" });
        }

        // Yadi chhaina bhane matra insert garne
        const sql = "INSERT INTO users (username, faculty_name, roll_no) VALUES (?, ?, ?)";
        db.query(sql, [username, faculty_name, roll_no], (err, result) => {
            if (err) return res.status(500).json(err);
            return res.json({ message: "User added successfully", id: result.insertId });
        });
    });
});

// 2. Login Route (New)
app.post('/login', (req, res) => {
    const { username } = req.body;
    const sql = "SELECT * FROM users WHERE username = ?";

    db.query(sql, [username], (err, data) => {
        if (err) return res.status(500).json(err);
        
        if (data.length > 0) {
            // User bhetiyo
            return res.json({ success: true, user: data[0] });
        } else {
            // User bhetiyena
            return res.status(404).json({ success: false, message: "User not found!" });
        }
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});