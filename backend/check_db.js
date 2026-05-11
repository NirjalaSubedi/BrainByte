const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'brainbyte',
    port: process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: false
    }
});

db.query('SELECT * FROM ragdoll_stats ORDER BY created_at DESC LIMIT 10', (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(JSON.stringify(results, null, 2));
    db.end();
});
