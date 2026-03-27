// email-api.js
// Simple Express API to send interview results via email

const express = require('express');
const bodyParser = require('body-parser');
const SibApiV3Sdk = require('sib-api-v3-sdk');

const app = express();
app.use(bodyParser.json());

const apiKey = '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'; // Store securely in production!
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyInstance = defaultClient.authentications['api-key'];
apiKeyInstance.apiKey = apiKey;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sender = { email: 'interviewai@yourdomain.com', name: 'Interview AI Results' };

app.post('/send-result', async (req, res) => {
  const { toEmail, subject, htmlContent } = req.body;
  if (!toEmail || !subject || !htmlContent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const sendSmtpEmail = {
    sender,
    to: [{ email: toEmail }],
    subject,
    htmlContent
  };
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Email API server running on port ${PORT}`);
});
