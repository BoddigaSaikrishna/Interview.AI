// send-email.js
// Usage: node send-email.js <toEmail> <subject> <content>

const SibApiV3Sdk = require('sib-api-v3-sdk');

const apiKey = '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'; // Store securely in production!

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyInstance = defaultClient.authentications['api-key'];
apiKeyInstance.apiKey = apiKey;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sender = { email: 'no-reply@yourdomain.com', name: 'Interview App' };

const toEmail = process.argv[2] || 'test@example.com';
const subject = process.argv[3] || 'Test Email from Interview App';
const content = process.argv[4] || 'This is a test email.';

const sendSmtpEmail = {
  sender,
  to: [{ email: toEmail }],
  subject,
  htmlContent: `<html><body><p>${content}</p></body></html>`
};

apiInstance.sendTransacEmail(sendSmtpEmail).then(
  function(data) {
    console.log('Email sent successfully:', data);
  },
  function(error) {
    console.error('Error sending email:', error);
  }
);
