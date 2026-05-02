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
    const { username, game_id, score } = req.body;
    if (!username || !game_id || typeof score === 'undefined') {
        return res.status(400).json({ message: 'username, game_id and score are required' });
    }

    const sql = 'INSERT INTO scores (username, game_id, score, played_at) VALUES (?, ?, ?, NOW())';
    db.query(sql, [username, game_id, score], (err, result) => {
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
            COUNT(*) AS total_plays,
            MAX(played_at) AS last_played
        FROM scores
        WHERE game_id = ? AND username = ?
    `;

    const recentSql = `
        SELECT id, score, played_at
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

            const stats = statsRows[0] || { best_score: 0, total_plays: 0, last_played: null };
            return res.json({
                username,
                bestScore: Number(stats.best_score) || 0,
                totalPlays: Number(stats.total_plays) || 0,
                lastPlayed: stats.last_played,
                recentScores: recentRows
            });
        });
    });
});