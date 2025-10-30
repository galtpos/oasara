// Test Resend API directly to see error details
import 'dotenv/config';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function testResend() {
  console.log('🧪 Testing Resend API...\n');
  console.log('API Key:', RESEND_API_KEY ? `${RESEND_API_KEY.slice(0, 10)}...` : 'NOT FOUND');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OASARA <noreply@oasara.com>',
        to: ['test@example.com'],
        subject: 'Test Email from OASARA',
        html: '<h1>Test Email</h1><p>This is a test email from OASARA.</p>',
      }),
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);

    const data = await response.json();
    console.log('\nResponse Data:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Email sent successfully!');
    } else {
      console.log('\n❌ Email failed to send');
      console.log('Error:', data.message || data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testResend();
