const db = require("../db");

async function getDailySummary() {
    try {
        const jobs = db.prepare(`
            SELECT subject, from_email, score, priority, link
            FROM jobs
            WHERE date(created_at) = date('now')
            ORDER BY score DESC
            LIMIT 10
        `).all();

        if (!jobs.length) {
            return "📭 No jobs found today";
        }

        // 🔥 Group jobs
        const applyNow = jobs.filter(j => j.priority.includes("APPLY_NOW"));
        const high = jobs.filter(j => j.priority.includes("HIGH"));
        const medium = jobs.filter(j => j.priority.includes("MEDIUM"));

        let message = "🚀 *DAILY JOB SUMMARY*\n\n";

        function formatGroup(title, list) {
            if (!list.length) return "";

            let text = `${title}\n---------------------\n`;

            list.forEach((job, index) => {
                text += `${index + 1}. ${job.subject}\n`;
                text += `⭐ ${job.score} | ${job.priority}\n`;
                text += `🔗 ${job.link || "No link"}\n\n`;
            });

            return text;
        }

        // 🔥 Build message
        message += formatGroup("🔥 APPLY NOW", applyNow);
        message += formatGroup("✅ HIGH PRIORITY", high);
        message += formatGroup("🟡 MEDIUM", medium);

        message += "✅ End of Summary";

        return message;

    } catch (err) {
        console.log("❌ Summary Error:", err.message);
        return "❌ Summary failed";
    }
}

module.exports = { getDailySummary };
