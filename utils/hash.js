const crypto = require("crypto");

function generateHash(subject, from) {
    return crypto
        .createHash("md5")
        .update(subject + from)
        .digest("hex");
}

module.exports = { generateHash };
