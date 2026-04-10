const Database = require('better-sqlite3');

// create DB file
const db = new Database('./data/reminders.db');

// create table
db.prepare(`
CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    time TEXT
)
`).run();

module.exports = db;
