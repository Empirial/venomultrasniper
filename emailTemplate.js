import { createTransport } from 'nodemailer';

// Create a transporter object using Gmail
const transporter = createTransport({
  host: 'smtp.gmail.com', // Change to your SMTP host (e.g., smtp.gmail.com)
  port: 587, // Or 465 for SSL
  secure: false, // true for 465, false for other ports
  requireTLS: true, // Ensures TLS is used
  auth: {
    user: 'mphelalufuno1.0@gmail.com',
    pass: 'salmgbvixmlgtkdv',
  },
});

function sendEmail(email_address, subject, text) {
 console.log('Sending email to:', email_address);

  const mailOptions = {
    from: 'mphelalufuno1.0@gmail.com', // Your email
    to: email_address, // Define email_address here
    subject: subject, // Use the subject parameter
    text: text, // Use the text parameter
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

export default sendEmail;

