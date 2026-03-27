// test-email-api.js
const fetch = require('node-fetch');

async function testSendEmail() {
  const response = await fetch('http://localhost:4000/send-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      toEmail: 'test@example.com',
      subject: 'Test Email',
      htmlContent: 'This is a test email from Brevo integration.'
    })
  });
  const data = await response.json();
  console.log('API response:', data);
}

testSendEmail();
