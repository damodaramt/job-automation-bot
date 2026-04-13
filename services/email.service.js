const imaps = require("imap-simple");
const config = require("../config/imap.config");
const { send } = require("./whatsapp.service");

// ===== MEMORY DEDUP (NO DB NEEDED) =====
const processed = new Set();

// ===== LINK =====
function getLink(body) {
  const match = body.match(/https?:\/\/[^\s>]+/);
  return match ? match[0] : "No link";
}

// ===== FILTER =====
function isJob(subject) {
  const s = subject.toLowerCase();

  // ❌ remove bulk emails
  const blocked = [
    "apply to jobs",
    "recommended",
    "top jobs",
    "unsubscribe",
    "newsletter",
    "multiple companies",
    "and more",
    "offers?"
  ];

  if (blocked.some(b => s.includes(b))) return false;

  // ✅ allow AI/ML roles
  return (
    s.includes("ai") ||
    s.includes("ml") ||
    s.includes("engineer") ||
    s.includes("developer") ||
    s.includes("data scientist")
  );
}

// ===== SCORE =====
function score(text) {
  text = text.toLowerCase();

  let s = 0;

  if (text.includes("ai engineer")) s += 50;
  if (text.includes("machine learning")) s += 40;
  if (text.includes("ml engineer")) s += 40;
  if (text.includes("data scientist")) s += 35;
  if (text.includes("llm")) s += 30;
  if (text.includes("rag")) s += 30;

  if (text.includes("python")) s += 10;
  if (text.includes("backend")) s += 10;

  return Math.min(s, 100);
}

// ===== PRIORITY =====
function getPriority(score) {
  if (score >= 80) return "🔥 HIGH";
  if (score >= 60) return "⚡ MEDIUM";
  return "LOW";
}

// ===== MAIN =====
async function checkEmails() {
  let conn;

  try {
    conn = await imaps.connect(config);

    // ✅ ALWAYS USE INBOX (IMPORTANT FIX)
    await conn.openBox("INBOX");

    // ✅ USE ALL (NOT UNSEEN)
    const emails = await conn.search(["ALL"], {
      bodies: ["HEADER.FIELDS (FROM SUBJECT)", "TEXT"],
      markSeen: false
    });

    if (!emails.length) {
      console.log("📭 No emails found");
      return;
    }

    console.log("📁 Total emails:", emails.length);

    for (let item of emails) {
      try {
        const header = item.parts.find(p => p.which.includes("HEADER")).body;
        const body = item.parts.find(p => p.which === "TEXT")?.body || "";

        const subject = header.subject?.[0] || "";
        const from = header.from?.[0] || "";

        const uniqueId = subject + from;

        // ✅ DEDUP
        if (processed.has(uniqueId)) {
          continue;
        }

        processed.add(uniqueId);

        console.log("📩 Checking:", subject);

        // FILTER
        if (!isJob(subject)) {
          console.log("🚫 Skipped");
          continue;
        }

        const text = subject + " " + body;

        const sc = score(text);

        if (sc < 40) {
          console.log("⛔ Low score:", sc);
          continue;
        }

        const priority = getPriority(sc);
        const link = getLink(body);

        const msg = `🚀 *JOB ALERT*

📌 ${subject}

⭐ Score: ${sc}
📊 ${priority}

🔗 ${link}`;

        console.log("📤 Sending WhatsApp...");
        await send(msg);

      } catch (err) {
        console.log("⚠️ Email parse error:", err.message);
      }
    }

  } catch (err) {
    console.log("❌ Email error:", err.message);
  } finally {
    if (conn) conn.end();
  }
}

module.exports = { checkEmails };
