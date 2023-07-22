const nodemailer = require("nodemailer");

function createTransporter() {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Replace with your preferred email service
    auth: {
      user: "", // Fill in your Gmail credentials
      pass: "",
    },
  });
  return transporter;
}

module.exports = { createTransporter };
