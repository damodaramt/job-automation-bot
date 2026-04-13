const Database = require("better-sqlite3");

// ✅ Create DB file
const db = new Database("./data/automation.db");

// ================= REMINDERS =================
db.prepare(`
CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

// ================= JOBS =================
db.prepare(`
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    subject TEXT,
    from_email TEXT,

    hash TEXT UNIQUE,

    priority TEXT,
    score INTEGER,

    link TEXT,

    status TEXT DEFAULT 'NEW',   -- NEW | APPLIED | SKIPPED

    applied_at DATETIME,         -- when applied
    skipped_at DATETIME,         -- when skipped

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

// ================= INDEX =================
db.prepare(`
CREATE INDEX IF NOT EXISTS idx_jobs_hash ON jobs(hash)
`).run();

db.prepare(`
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)
`).run();

module.exports = db;
