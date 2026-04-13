require("dotenv").config();

const cron = require("node-cron");
const { checkEmails } = require("./services/email.service");

console.log("🚀 System Started");

// ==============================
// 🔒 LOCK (prevent overlapping)
// ==============================
let isRunning = false;

// ==============================
// ⚡ RUN ON START (ONCE)
// ==============================
(async () => {
  try {
    console.log("⚡ Initial check...");
    await checkEmails();
  } catch (err) {
    console.log("❌ Initial Error:", err.message);
  }
})();

// ==============================
// 📩 EMAIL CHECK (Every 2 min)
// ==============================
cron.schedule("*/2 * * * *", async () => {
  if (isRunning) {
    console.log("⏳ Skipping (already running)");
    return;
  }

  try {
    isRunning = true;

    console.log("📬 Checking emails...");
    await checkEmails();

  } catch (err) {
    console.log("❌ Cron Error:", err.message);
  } finally {
    isRunning = false;
  }
});

// ==============================
// 💓 HEALTH LOG (Every 5 min)
// ==============================
setInterval(() => {
  console.log("💓 Bot alive:", new Date().toLocaleTimeString());
}, 5 * 60 * 1000);

// ==============================
// 🔴 GLOBAL ERROR HANDLING
// ==============================
process.on("uncaughtException", (err) => {
  console.log("❌ Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.log("❌ Unhandled Rejection:", err);
});
