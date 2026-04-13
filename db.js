const Database = require("better-sqlite3");

const db = new Database("database.sqlite");

db.prepare(`
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT,
    from_email TEXT,
    hash TEXT UNIQUE,
    priority TEXT,
    score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

module.exports = db;
