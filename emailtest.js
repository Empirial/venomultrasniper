const nodemailer = require('nodemailer');
require ('dotenv').config();

// Create a transporter object using Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Change to your SMTP host (e.g., smtp.gmail.com)
  port: 587, // Or 465 for SSL
  secure: false, // true for 465, false for other ports
  requireTLS: true, // Ensures TLS is used
  auth: {
    user: process.envtest.EMAIL_USER,
    pass: process.envtest.EMAIL_PASS,
  },
});

function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

module.exports = sendEmail;
