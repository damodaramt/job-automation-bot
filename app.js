require("dotenv").config();

const { checkEmails } = require("./services/email.service");

console.log("🚀 System Started");

// run immediately
checkEmails();

// run every 2 minutes
setInterval(() => {
  console.log("Checking emails...");
  checkEmails();
}, 2 * 60 * 1000);
