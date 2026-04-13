const imaps = require("imap-simple");
const config = require("../config/imap.config");
const { sendMessage } = require("./whatsapp.service");
const { matchScore, getPriority } = require("../utils/resumeMatcher");

// ===== MEMORY DEDUP =====
const processed = new Set();

// ===== CLEAN LINK EXTRACTOR =====
function getLink(body) {
  const links = body.match(/https?:\/\/[^\s>"]+/g) || [];

  const valid = links.filter(link =>
    !link.includes("linkedin.com/comm") &&
    !link.includes("linkedin.com/feed") &&
    !link.includes("w3.org") &&
    !link.includes("example.com") &&
    !link.includes("unsubscribe")
  );

  return valid[0] || "No valid job link";
}

// ===== FILTER =====
function isJob(subject) {
  const s = subject.toLowerCase();

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

  return (
    s.includes("ai") ||
    s.includes("ml") ||
    s.includes("engineer") ||
    s.includes("developer") ||
    s.includes("data scientist")
  );
}

// ===== MAIN =====
async function checkEmails() {
  let conn;

  try {
    conn = await imaps.connect(config);
    await conn.openBox("INBOX");

    const emails = await conn.search(["UNSEEN"], {
      bodies: ["HEADER.FIELDS (FROM SUBJECT)", "TEXT"],
      markSeen: true
    });

    if (!emails.length) {
      console.log("📭 No new emails");
      return;
    }

    console.log("📩 New emails:", emails.length);

    for (let item of emails) {
      try {
        const header = item.parts.find(p => p.which.includes("HEADER")).body;
        const body = item.parts.find(p => p.which === "TEXT")?.body || "";

        const subject = header.subject?.[0] || "";
        const from = header.from?.[0] || "";

        const uniqueId = subject + from;

        // ✅ DEDUP
        if (processed.has(uniqueId)) continue;
        processed.add(uniqueId);

        console.log("🔍 Checking:", subject);

        // ❌ FILTER
        if (!isJob(subject)) {
          console.log("🚫 Skipped");
          continue;
        }

        const text = subject + " " + body;

        // ✅ RESUME-AWARE SCORE
        const score = matchScore(text);
        const priority = getPriority(score);

        // ❌ IGNORE LOW QUALITY
        if (priority === "❌ IGNORE") {
          console.log("🚫 Ignored by AI");
          continue;
        }

        const link = getLink(body);

        const msg = `🚀 *AI JOB ALERT*

📌 ${subject}

⭐ Score: ${score}
${priority}

🔗 ${link}`;

        console.log("📤 Sending WhatsApp...");
        await sendMessage(msg);

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
