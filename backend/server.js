const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",      // Default XAMPP user
    password: "",      // Default XAMPP password is empty
    database: "brainbyte"
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL Database!');
});

// API Route to save user
app.post('/add-user', (req, res) => {
    const { username, faculty_name, roll_no } = req.body;
    const sql = "INSERT INTO users (username, faculty_name, roll_no) VALUES (?, ?, ?)";
    
    db.query(sql, [username, faculty_name, roll_no], (err, result) => {
        if (err) return res.json(err);
        return res.json({ message: "User added successfully", id: result.insertId });
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});