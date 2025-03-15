import express from 'express';
import bodyParser from 'body-parser';
import readExcel from './excelReader.js';
import sendEmail from './emailTemplate.js';
import axios from 'axios';

const WEBSITEURL = 'https://www.venomultrasniper.co.za'; // Update with your Ngrok URL
const PAYPAL_WEBHOOK_URL = 'https://www.venomultrasniper.co.za/paypal-webhook';

const PAYPAL_CLIENT_ID = 'AcmdeCLvIpOnkU_9MGPXpnOVXbsGjFuLLlI7gwDMerztXTd1c8vFxOJ3WeXV5vvoH5_0jTIMkXTQjMzF';
const PAYPAL_SECRET = 'ECPXR1gKicEEhQGKXb0VWR8cud_qIglyasKPiO7GU0TFebKy7MelNTk_73x2AHuqNmagwJ0jJ2wXW-Ex';

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

async function registerPayPalWebhook() {
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) return;

  try {
    const response = await axios.post(
      'https://api-m.paypal.com/v1/notifications/webhooks',
      {
        url: PAYPAL_WEBHOOK_URL,
        event_types: [{ name: 'PAYMENT.CAPTURE.COMPLETED' }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('PayPal Webhook registered:', response.data);
  } catch (error) {
    console.error('Error registering PayPal webhook:', error.response?.data || error.message);
  }
}

// Run webhook registration (uncomment to register the webhook)
//registerPayPalWebhook();

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/paypal-webhook', async (req, res) => {
  const event = req.body;
  console.log('Received PayPal Webhook Event:', event);

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const paymentData = event.resource;
    const amount = parseFloat(paymentData.amount.value);
    console.log(`Payment received: ${amount} ${paymentData.amount.currency_code}`);

    // Read the Excel file and get an unused license key
    const filePath = 'Whatsapp Numbers.xlsx';
    const extractedNumber = await readExcel(filePath);  // Sheet name not needed since we have default setup in readExcel

    if (extractedNumber) {
      const email_address = req.body.resource.payer.email_address; // Extract email from webhook
      sendEmail(email_address, event.resource.amount.value); // Send email to the payer

      // Send an email with the license key
      const emailSubject = 'Payment Received';
      const emailText = `Welcome to the family. License key: ${extractedNumber}`;
      sendEmail(email_address, emailSubject, emailText); // Use the extracted email address here
      console.log(`Email sent successfully to ${email_address}!`);
    } else {
      console.error('No available license keys left.');
    }
  }

  res.sendStatus(200); // Respond to PayPal to acknowledge the webhook
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
