const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const USER = "918897792343@c.us";

let client;
let ready = false;
let started = false;
let queue = [];
let sending = false;

// ================= INIT =================
function init() {
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: "./.wwebjs_auth"
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
  });

  client.on("qr", (qr) => {
    console.log("📱 Scan WhatsApp QR");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", async () => {
    console.log("✅ WhatsApp Ready");
    ready = true;

    await flushQueue();

    // ✅ send only once
    if (!started) {
      await safeSend("🤖 Job Automation Started");
      started = true;
    }
  });

  client.on("disconnected", () => {
    console.log("⚠️ WhatsApp Disconnected");
    ready = false;

    setTimeout(() => {
      console.log("🔄 Reconnecting...");
      init();
    }, 5000);
  });

  client.on("error", (err) => {
    console.log("❌ WhatsApp Error:", err.message);
  });

  client.initialize();
}

// ================= SAFE SEND =================
async function safeSend(message) {
  if (!message || typeof message !== "string") return;

  if (!ready) {
    queue.push(message);
    return;
  }

  // prevent parallel sending
  if (sending) {
    queue.push(message);
    return;
  }

  sending = true;

  try {
    await client.sendMessage(USER, message);
    console.log("📤 Sent:", message.slice(0, 60));
  } catch (err) {
    console.log("❌ Send error:", err.message);

    // retry
    setTimeout(() => queue.push(message), 3000);
  }

  sending = false;
}

// ================= QUEUE =================
async function flushQueue() {
  while (queue.length > 0) {
    const msg = queue.shift();
    await safeSend(msg);
  }
}

// ================= PUBLIC =================
async function sendMessage(message) {
  await safeSend(message);
}

// ================= KEEP ALIVE =================
setInterval(() => {
  if (ready) console.log("💓 WhatsApp alive");
}, 60000);

// ================= START =================
init();

// ✅ EXPORT CORRECT FUNCTION
module.exports = { sendMessage };
