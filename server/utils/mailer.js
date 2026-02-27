const nodemailer = require('nodemailer');

// fallback logger transport if configuration missing
let transporter;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  console.warn('Mailer: SMTP not configured, emails will be logged');
  transporter = {
    sendMail: async (opts) => {
      console.log('=== simulated email ===');
      console.log(opts);
      console.log('=======================');
      return;
    }
  };
}

module.exports = transporter;