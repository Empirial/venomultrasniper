import express from 'express';
import bodyParser from 'body-parser';
import readExcel from './excelReader.js';
import sendEmail from './emailTemplate.js';
import axios from 'axios';

const WEBSITE_URL = 'https://www.venomultrasniper.co.za';
const PAYPAL_WEBHOOK_URL = 'https://www.venomultrasniper.co.za/paypal-webhook';

// PayPal Credentials - Ideally load from environment variables in production
const PAYPAL_CLIENT_ID = 'AX7kdtBkf0GoNx7yv1PR5hAThEjzQI6lttiAjGBGuuoGXI-0VS_f_Fla2c2IG3i-5tDry5g5qUb7WFTK';
const PAYPAL_SECRET = 'EB-uGmUQBXpV1dvWAf9g9vu1mm9cmYwViAhX1kgxPI0MnewXgknyOFhlbkYU7GLi3bUCxLbfM3RnviZZ';

async function getPayPalAccessToken() {
  try {
    const response = await axios.post(
      'https://api-m.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error.response?.data || error.message);
    return null;
  }
}

async function verifyWebhookSignature(req) {
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) return false;

  const headers = req.headers;
  console.log('Webhook Headers:', headers); // Useful for debugging
  console.log('Webhook Payload:', req.body);

  const verificationBody = {
    webhook_id: '9M995526S3884594J', // Replace with your actual live webhook ID
    transmission_id: headers['paypal-transmission-id'],
    transmission_time: headers['paypal-transmission-time'],
    cert_url: headers['paypal-cert-url'],
    auth_algo: headers['paypal-auth-algo'],
    transmission_sig: headers['paypal-transmission-sig'],
    webhook_event: req.body,
  };

  try {
    const response = await axios.post(
      'https://api-m.paypal.com/v1/notifications/verify-webhook-signature',
      verificationBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Webhook signature verification failed:', error.response?.data || error.message);
    return false;
  }
}

const app = express();
const port = 10000;

app.use(bodyParser.json());

app.post('/paypal-webhook', async (req, res) => {
  const isVerified = await verifyWebhookSignature(req);
  if (!isVerified) {
    console.error('Invalid webhook signature');
    return res.sendStatus(400);
  }

  const event = req.body;
  console.log('Received PayPal Webhook Event:', event);

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const paymentData = event.resource;
    const amount = parseFloat(paymentData.amount.value);
    console.log(`Payment received: ${amount} ${paymentData.amount.currency_code}`);

    const filePath = 'Whatsapp Numbers.xlsx';
    const extractedNumber = await readExcel(filePath);

    if (extractedNumber) {
      const email_address = paymentData.payer.email_address;
      const emailSubject = 'Payment Received';
      const emailText = `Welcome to the family. License key: ${extractedNumber}`;
      sendEmail(email_address, emailSubject, emailText);
      console.log(`Email sent successfully to ${email_address}!`);
    } else {
      console.error('No available license keys left.');
    }
  }

  res.sendStatus(200);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});
