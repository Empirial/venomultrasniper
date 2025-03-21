import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const CLIENT_ID = '837872949349-6pmm5784e71fcdh348j6l752ceb4io4d.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04Pu5hf0JX2uvCgYIARAAGAQSNwF-L9IrMQizUG5G62HEjnK6EuqHKeFtTvCUoPZxE_MPmvlrGsv0-YmcTV6ADI5cCC07P3v5i9o';
const USER_EMAIL = 'emmanuelrivombo03@gmail.com';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmail(email_address, subject, text) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: USER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `Venom Ultra Sniper <${USER_EMAIL}>`,
      to: email_address,
      subject: subject,
      text: text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email_address}`);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export default sendEmail;


