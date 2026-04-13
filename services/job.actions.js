const db = require("./db");

// ================= APPLY JOB =================
function applyJob(id) {
    const job = db.prepare("SELECT * FROM jobs WHERE id=?").get(id);

    if (!job) {
        return "❌ Job not found";
    }

    db.prepare(`
        UPDATE jobs
        SET status='APPLIED', applied_at=CURRENT_TIMESTAMP
        WHERE id=?
    `).run(id);

    return `✅ Applied:\n${job.subject}`;
}

// ================= SKIP JOB =================
function skipJob(id) {
    const job = db.prepare("SELECT * FROM jobs WHERE id=?").get(id);

    if (!job) {
        return "❌ Job not found";
    }

    db.prepare(`
        UPDATE jobs
        SET status='SKIPPED', skipped_at=CURRENT_TIMESTAMP
        WHERE id=?
    `).run(id);

    return `⏭️ Skipped:\n${job.subject}`;
}

// ================= LIST JOBS =================
function listJobs() {
    const jobs = db.prepare(`
        SELECT id, subject, score, status
        FROM jobs
        ORDER BY created_at DESC
        LIMIT 10
    `).all();

    if (!jobs.length) return "📭 No jobs";

    let msg = "📊 Recent Jobs:\n\n";

    jobs.forEach(j => {
        msg += `${j.id}. ${j.subject}\n⭐ ${j.score} | ${j.status}\n\n`;
    });

    return msg;
}

module.exports = { applyJob, skipJob, listJobs };
