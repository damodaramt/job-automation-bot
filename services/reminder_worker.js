const db = require('./db');

console.log("⏰ Reminder worker running...");

setInterval(() => {

    try {
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

        console.log("Checking reminders:", now);

        const rows = db.prepare(
            "SELECT * FROM reminders WHERE time <= ?"
        ).all(now);

        for (let r of rows) {
            console.log("🔔 Reminder:", r.message);

            // Just log (no WhatsApp here)

            db.prepare("DELETE FROM reminders WHERE id = ?").run(r.id);
        }

    } catch (err) {
        console.error("Worker error:", err);
    }

}, 60000);
