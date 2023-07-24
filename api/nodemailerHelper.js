const nodemailer = require("nodemailer");
require("dotenv").config();

function createTransporter() {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Replace with your preferred email service
    auth: {
      user: `${process.env.GMAIL_USER}`,
      pass: `${process.env.GMAIL_PASS}`,
    },
  });
  return transporter;
}

module.exports = { createTransporter };
