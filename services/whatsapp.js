const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const db = require('./db');
const { askAI } = require('../ai/ollama');

// CONFIG
const USER_NUMBER = "918897792343@c.us";
const PRIVATE_MODE = false;
const AUTO_REPLY = true;

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '../.wwebjs_auth')
    }),
    puppeteer: {
        executablePath: '/usr/bin/chromium-browser',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// QR
client.on('qr', qr => {
    console.log('Scan QR:');
    qrcode.generate(qr, { small: true });
});

// READY
client.on('ready', async () => {
    console.log('✅ WhatsApp READY');

    await client.sendMessage(USER_NUMBER, "System started ✅");

    // 🔔 Reminder system
    setInterval(async () => {
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

        const rows = db.prepare(
            "SELECT * FROM reminders WHERE time <= ?"
        ).all(now);

        for (let r of rows) {
            await client.sendMessage(
                USER_NUMBER,
                `Reminder: ${r.message}`
            );

            db.prepare("DELETE FROM reminders WHERE id = ?").run(r.id);
        }

    }, 60000);
});

// MESSAGE HANDLER
client.on('message', async msg => {

    const text = msg.body.toLowerCase().trim();
    const sender = msg.from;

    console.log(sender, text);

    // 🔒 PRIVATE MODE
    if (PRIVATE_MODE && sender !== USER_NUMBER) return;

    // 🤖 AUTO REPLY (YOUR STYLE)
    if (sender !== USER_NUMBER && AUTO_REPLY) {

        if (text === 'hi' || text === 'hello') {
            return msg.reply("Hi 👋, noted. Will get back to you soon.");
        }

        if (text.includes('call')) {
            return msg.reply("Currently unavailable. Will respond shortly.");
        }

        return msg.reply("Noted. Will get back to you soon.");
    }

    // ===== YOUR COMMANDS =====

    if (text === 'hi') {
        await msg.reply("Hello 👋");
    }

    else if (text === 'status') {
        await msg.reply("System running ✅");
    }

    else if (text.startsWith('echo ')) {
        await msg.reply(msg.body.slice(5));
    }

    else if (text.startsWith('remind ')) {
        try {
            const parts = msg.body.split(' ');
            const time = parts[1] + " " + parts[2];
            const message = parts.slice(3).join(' ');

            db.prepare(
                "INSERT INTO reminders (message, time) VALUES (?, ?)"
            ).run(message, time);

            await msg.reply("Reminder set ✅");
        } catch {
            await msg.reply("Format: remind YYYY-MM-DD HH:MM text");
        }
    }

    else if (text === 'list') {
        const rows = db.prepare("SELECT * FROM reminders").all();

        if (rows.length === 0) {
            await msg.reply("No reminders");
        } else {
            let res = "Reminders:\n";
            rows.forEach(r => {
                res += `${r.id}. ${r.message}\n`;
            });
            await msg.reply(res);
        }
    }

    else if (text.startsWith('delete ')) {
        const id = text.split(' ')[1];
        db.prepare("DELETE FROM reminders WHERE id = ?").run(id);
        await msg.reply("Deleted ✅");
    }

    else if (text === 'clear') {
        db.prepare("DELETE FROM reminders").run();
        await msg.reply("All cleared ✅");
    }

    else if (text === 'today') {
        const today = new Date().toISOString().split('T')[0];

        const rows = db.prepare(
            "SELECT * FROM reminders WHERE time LIKE ?"
        ).all(`${today}%`);

        if (rows.length === 0) {
            await msg.reply("No tasks today");
        } else {
            let res = "Today:\n";
            rows.forEach(r => {
                res += `• ${r.message}\n`;
            });
            await msg.reply(res);
        }
    }

    else if (text.startsWith('ai ')) {
        await msg.reply("...");

        const response = await askAI(msg.body.slice(3));

        await msg.reply(response);
    }

    else if (text === 'help') {
        await msg.reply(
`Commands:
hi
status
remind
list
delete
clear
today
ai`
        );
    }

    else {
        await msg.reply("Type 'help'");
    }
});

client.initialize();
