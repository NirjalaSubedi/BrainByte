const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'SpaceWaves_Super_Secret_Key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 6
    }
}));

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'spacewaves',
    waitForConnections: true,
    connectionLimit: 10
});

function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Login required' });
    }
    next();
}

app.get('/health', (req, res) => {
    res.json({ ok: true });
});

app.get('/db-test', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ ok: true, db: 'connected' });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Username-only login:
// user exists -> login
// user not exists -> auto-create then login
app.post('/auth/login', async (req, res) => {
    try {
        const username = String(req.body.username || '').trim().slice(0, 50);

        if (!username) {
            return res.status(400).json({ error: 'Username required' });
        }

        const [rows] = await pool.query(
            'SELECT id, username FROM users WHERE username = ? LIMIT 1',
            [username]
        );

        let userId;
        let finalUsername;

        if (rows.length > 0) {
            userId = rows[0].id;
            finalUsername = rows[0].username;
        } else {
            const [insertResult] = await pool.query(
                'INSERT INTO users (username) VALUES (?)',
                [username]
            );
            userId = insertResult.insertId;
            finalUsername = username;
        }

        req.session.userId = userId;
        req.session.username = finalUsername;

        res.json({
            success: true,
            userId,
            username: finalUsername
        });
    } catch (error) {
        console.error('POST /auth/login failed:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/auth/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ loggedIn: false });
    }

    res.json({
        loggedIn: true,
        userId: req.session.userId,
        username: req.session.username
    });
});

app.post('/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

app.post('/submit-score', requireLogin, async (req, res) => {
    try {
        const scoreNum = Number(req.body.score);

        if (!Number.isFinite(scoreNum)) {
            return res.status(400).json({ error: 'Score must be a number' });
        }

        const score = Math.max(0, Math.floor(scoreNum));

        await pool.query(
            'INSERT INTO leaderboard (user_id, score) VALUES (?, ?)',
            [req.session.userId, score]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('POST /submit-score failed:', error);
        res.status(500).json({ error: 'Failed to submit score' });
    }
});

app.get('/leaderboard', async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT l.id, u.username, l.score, l.created_at
      FROM leaderboard l
      JOIN users u ON u.id = l.user_id
      ORDER BY l.score DESC, l.created_at ASC
      LIMIT 10
    `);

        res.json(rows);
    } catch (error) {
        console.error('GET /leaderboard failed:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

app.listen(PORT, async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Database connected successfully.');
    } catch (error) {
        console.error('Database connect failed:', error.message);
    }
    console.log('Backend running on port 3000');
});