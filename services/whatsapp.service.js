const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const USER = "918897792343@c.us";

let client;
let ready = false;
let started = false;

function init() {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ["--no-sandbox"] }
  });

  client.on("qr", (qr) => {
    console.log("Scan QR");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", async () => {
    console.log("WhatsApp Ready");
    ready = true;

    if (!started) {
      await send("🤖 Job Automation Started");
      started = true;
    }
  });

  client.on("disconnected", () => {
    console.log("Disconnected");
    ready = false;
    setTimeout(init, 5000);
  });

  client.initialize();
}

async function send(msg) {
  if (!ready) {
    console.log("WA not ready");
    return;
  }

  try {
    await client.sendMessage(USER, msg);
    console.log("Sent:", msg.slice(0, 50));
  } catch (e) {
    console.log("Send error:", e.message);
  }
}

init();

module.exports = { send };
