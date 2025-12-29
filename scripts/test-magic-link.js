/**
 * Magic Link Email Deliverability Test
 * Tests authentication flow and email delivery across major providers
 *
 * Usage:
 *   node scripts/test-magic-link.js
 *
 * Requirements:
 *   - Resend SMTP configured in Supabase
 *   - DNS records (SPF, DKIM) verified
 *   - Test email addresses for each provider
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Test email addresses - REPLACE WITH YOUR OWN
const testEmails = [
  // Gmail: Known for aggressive spam filtering
  'test+gmail@example.com',

  // Outlook/Hotmail: Microsoft's email service
  'test+outlook@example.com',

  // Yahoo: Another major provider
  'test+yahoo@example.com',

  // ProtonMail: Privacy-focused, strict filtering
  'test+proton@example.com',
];

/**
 * Test magic link delivery to a single email address
 */
async function testMagicLink(email) {
  console.log(`\n🔐 Testing magic link for: ${email}`);

  const startTime = Date.now();

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: 'https://oasara.com/auth/callback',
        // Optional: Add custom data
        data: {
          test_run: true,
          timestamp: new Date().toISOString(),
        }
      }
    });

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return {
        email,
        success: false,
        error: error.message,
        duration
      };
    }

    console.log(`✅ Magic link sent successfully! (${duration}ms)`);
    return {
      email,
      success: true,
      duration
    };

  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`❌ Exception: ${err.message}`);
    return {
      email,
      success: false,
      error: err.message,
      duration
    };
  }
}

/**
 * Display a pretty results table
 */
function displayResults(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY\n');

  // Statistics
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgDuration = Math.round(
    results.reduce((sum, r) => sum + r.duration, 0) / results.length
  );

  console.log(`✅ Successful: ${successful}/${results.length} (${Math.round(successful/results.length*100)}%)`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Average Send Time: ${avgDuration}ms\n`);

  // Results table
  console.log('┌─────────────────────────────┬─────────┬────────────┬─────────────────────────────┐');
  console.log('│ Email                       │ Status  │ Time (ms)  │ Error                       │');
  console.log('├─────────────────────────────┼─────────┼────────────┼─────────────────────────────┤');

  results.forEach(r => {
    const emailPadded = r.email.padEnd(27);
    const status = r.success ? '✅ Sent' : '❌ Fail';
    const statusPadded = status.padEnd(7);
    const duration = r.duration.toString().padEnd(10);
    const error = r.error ? r.error.substring(0, 27) : '-';
    const errorPadded = error.padEnd(27);

    console.log(`│ ${emailPadded} │ ${statusPadded} │ ${duration} │ ${errorPadded} │`);
  });

  console.log('└─────────────────────────────┴─────────┴────────────┴─────────────────────────────┘');

  // Failed emails detail
  if (failed > 0) {
    console.log('\n❌ FAILED EMAILS (DETAILS):\n');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ${r.email}`);
      console.log(`   └─ Error: ${r.error}\n`);
    });
  }

  // Next steps
  console.log('\n📧 NEXT STEPS:\n');
  console.log('   1. Check the following inboxes (and spam folders):');
  testEmails.forEach(email => console.log(`      - ${email}`));
  console.log('\n   2. Verify email content:');
  console.log('      - Oasara branding visible');
  console.log('      - CTA button clickable');
  console.log('      - Mobile responsive');
  console.log('\n   3. Test magic link functionality:');
  console.log('      - Click link → Should redirect to https://oasara.com/auth/callback');
  console.log('      - Should log you in successfully');
  console.log('      - Link expires in 1 hour');
  console.log('\n   4. Check spam score:');
  console.log('      - Forward one email to: check@mail-tester.com');
  console.log('      - Visit: https://www.mail-tester.com/');
  console.log('      - Aim for: 8/10 or higher');
  console.log('\n   5. Verify DNS records:');
  console.log('      - SPF:  dig +short TXT oasara.com | grep spf');
  console.log('      - DKIM: dig +short TXT resend._domainkey.oasara.com');
  console.log('      - DMARC: dig +short TXT _dmarc.oasara.com');

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Oasara Magic Link Deliverability Test');
  console.log('Testing across major email providers...\n');
  console.log('⚠️  Make sure you\'ve updated test email addresses in this script!\n');

  // Validate environment
  if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.error('   Make sure .env.local is configured correctly\n');
    process.exit(1);
  }

  // Check if using example emails
  const hasExampleEmails = testEmails.some(e => e.includes('example.com'));
  if (hasExampleEmails) {
    console.error('❌ Error: Still using example.com email addresses!');
    console.error('   Please update testEmails array with real test addresses\n');
    process.exit(1);
  }

  const results = [];

  // Run tests sequentially to avoid rate limiting
  for (const email of testEmails) {
    const result = await testMagicLink(email);
    results.push(result);

    // Wait 2 seconds between sends (Resend free tier: 1 req/sec)
    if (testEmails.indexOf(email) < testEmails.length - 1) {
      console.log('   ⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Display results
  displayResults(results);

  // Exit code based on success rate
  const successRate = results.filter(r => r.success).length / results.length;
  process.exit(successRate >= 0.9 ? 0 : 1); // Success if >90% delivered
}

// Run tests
runTests().catch(err => {
  console.error('\n💥 Unexpected error:', err);
  process.exit(1);
});
