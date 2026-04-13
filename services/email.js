const imaps = require('imap-simple');

const USER_NUMBER = "918897792343@c.us";

const config = {
    imap: {
        user: "damodaramt.ai@gmail.com",
        password: "whpotjotrfrpfilh",
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 15000
    }
};

async function checkEmails(client) {
    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const messages = await connection.search(['UNSEEN'], {
            bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)'],
            markSeen: true
        });

        if (!messages.length) {
            connection.end();
            return;
        }

        for (let item of messages) {
            const header = item.parts[0].body;

            const from = header.from?.[0] || "";
            const subject = header.subject?.[0] || "";

            const text = (subject + " " + from).toLowerCase();

            // 🔥 HIGH PRIORITY KEYWORDS
            const highKeywords = [
                "ai", "ml", "machine learning", "llm",
                "rag", "mlops", "devops", "kubernetes",
                "docker", "data engineer"
            ];

            // ❌ IGNORE KEYWORDS
            const ignoreKeywords = [
                "sale", "discount", "offer",
                "marketing", "promo", "internship unpaid"
            ];

            // ❌ SKIP SPAM
            if (ignoreKeywords.some(k => text.includes(k))) continue;

            let priority = "🟡 NORMAL";
            if (highKeywords.some(k => text.includes(k))) {
                priority = "🔥 HIGH PRIORITY";
            }

            const message =
`${priority} JOB ALERT

📌 ${subject}
👤 ${from}

👉 Action: Check & Apply ASAP`;

            await client.sendMessage(USER_NUMBER, message);
        }

        connection.end();

    } catch (err) {
        console.log("Email error:", err.message);
    }
}

module.exports = { checkEmails };
