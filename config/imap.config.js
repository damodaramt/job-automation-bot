require("dotenv").config();

module.exports = {
    imap: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,

        host: "imap.gmail.com",
        port: 993,
        tls: true,

        tlsOptions: {
            rejectUnauthorized: false
        },

        authTimeout: 15000,
        connTimeout: 10000,

        keepalive: {
            interval: 10000,
            idleInterval: 300000,
            forceNoop: true
        }
    }
};
