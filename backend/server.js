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

// 3. Add score route for games
app.post('/add-score', (req, res) => {
    const { username, game_id, score, level, outLevel, out_level } = req.body;
    if (!username || !game_id || typeof score === 'undefined') {
        return res.status(400).json({ message: 'username, game_id and score are required' });
    }

    const levelInput = outLevel ?? out_level ?? level;
    const parsedLevel = Number.parseInt(levelInput, 10);
    const finalLevel = Number.isFinite(parsedLevel) && parsedLevel > 0 ? parsedLevel : 1;

    const sql = 'INSERT INTO scores (username, game_id, score, level, played_at) VALUES (?, ?, ?, ?, NOW())';
    db.query(sql, [username, game_id, score, finalLevel], (err, result) => {
        if (err) {
            console.error('Error inserting score:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        return res.json({ message: 'Score saved', id: result.insertId });
    });
});

// Helper: fetch recent scores for a game
app.get('/scores/:game', (req, res) => {
    const game = req.params.game;
    const sql = 'SELECT id, username, game_id, score, played_at FROM scores WHERE game_id = ? ORDER BY played_at DESC LIMIT 50';
    db.query(sql, [game], (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        return res.json(rows);
    });
});

// Leaderboard: best score per user for a game
app.get('/scores/:game/top', (req, res) => {
    const game = req.params.game;
    const parsedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isNaN(parsedLimit) ? 10 : Math.max(1, Math.min(parsedLimit, 100));

    const sql = `
        SELECT
            username,
            MAX(score) AS best_score,
            MAX(level) AS level,
            COUNT(*) AS total_plays,
            MAX(played_at) AS last_played
        FROM scores
        WHERE game_id = ?
        GROUP BY username
        ORDER BY best_score DESC, last_played DESC
        LIMIT ?
    `;

    db.query(sql, [game, limit], (err, rows) => {
        if (err) {
            console.error('Error fetching leaderboard:', err);
            return res.status(500).json({ message: 'DB error' });
        }
        return res.json(rows);
    });
});

// User stats for a specific game
app.get('/scores/:game/user/:username', (req, res) => {
    const game = req.params.game;
    const username = req.params.username;

    const statsSql = `
        SELECT
            COALESCE(MAX(score), 0) AS best_score,
            COALESCE(MAX(level), 1) AS level,
            COUNT(*) AS total_plays,
            MAX(played_at) AS last_played
        FROM scores
        WHERE game_id = ? AND username = ?
    `;

    const recentSql = `
        SELECT id, score, level, played_at
        FROM scores
        WHERE game_id = ? AND username = ?
        ORDER BY played_at DESC
        LIMIT 10
    `;

    db.query(statsSql, [game, username], (statsErr, statsRows) => {
        if (statsErr) {
            console.error('Error fetching user score stats:', statsErr);
            return res.status(500).json({ message: 'DB error' });
        }

        db.query(recentSql, [game, username], (recentErr, recentRows) => {
            if (recentErr) {
                console.error('Error fetching user recent scores:', recentErr);
                return res.status(500).json({ message: 'DB error' });
            }

            const stats = statsRows[0] || { best_score: 0, level: 1, total_plays: 0, last_played: null };
            return res.json({
                username,
                bestScore: Number(stats.best_score) || 0,
                level: Number(stats.level) || 1,
                totalPlays: Number(stats.total_plays) || 0,
                lastPlayed: stats.last_played,
                recentScores: recentRows
            });
        });
    });
});