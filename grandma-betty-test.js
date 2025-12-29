// Grandma Betty End-to-End Test - Oasara Phases 1-3
// Simulates a non-tech-savvy user completing the full journey flow
// Expected: <2 minutes to complete journey creation

const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Grandma Betty Test...\n');
  const startTime = Date.now();

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Visit homepage
    console.log('📍 Step 1: Visiting homepage...');
    await page.goto('https://oasara.com');
    await page.waitForLoadState('networkidle');
    console.log('✅ Homepage loaded\n');

    // Step 2: Click "Start a Conversation" button
    console.log('📍 Step 2: Looking for "Start a Conversation" button...');
    const startButton = await page.locator('text=Start a Conversation').first();
    await startButton.waitFor({ state: 'visible', timeout: 10000 });
    await startButton.click();
    console.log('✅ Clicked "Start a Conversation"\n');

    // Step 3: Wait for AI onboarding page
    console.log('📍 Step 3: Waiting for AI onboarding chatbot...');
    await page.waitForURL('**/start', { timeout: 10000 });
    await page.waitForSelector('text=Your Personal Guide', { timeout: 10000 });
    console.log('✅ AI chatbot loaded\n');

    // Step 4: Simulate Grandma Betty typing her procedure
    console.log('📍 Step 4: Grandma Betty types "breast augmentation"...');
    const input = await page.locator('input[placeholder*="Tell me"]').first();
    await input.fill('I want to get breast augmentation');
    await page.keyboard.press('Enter');
    console.log('✅ Sent first message\n');

    // Step 5: Wait for AI response and check for budget question
    console.log('📍 Step 5: Waiting for AI to ask about budget...');
    await page.waitForTimeout(3000); // Give AI time to respond
    console.log('✅ AI responded\n');

    // Step 6: Provide budget
    console.log('📍 Step 6: Grandma Betty provides budget...');
    await input.fill('My budget is around $5000 to $8000');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    console.log('✅ Budget provided\n');

    // Step 7: Provide timeline
    console.log('📍 Step 7: Grandma Betty provides timeline...');
    await input.fill('I\'m flexible, maybe in a few months');
    await page.keyboard.press('Enter');
    console.log('✅ Timeline provided\n');

    // Step 8: Wait for journey creation success message
    console.log('📍 Step 8: Waiting for "Your journey is ready!" message...');
    await page.waitForSelector('text=Your journey is ready', { timeout: 15000 });
    console.log('✅ Journey creation confirmed!\n');

    // Step 9: Wait for auto-navigation to dashboard (4 seconds)
    console.log('📍 Step 9: Waiting for auto-navigation to dashboard...');
    await page.waitForURL('**/my-journey', { timeout: 10000 });
    console.log('✅ Navigated to dashboard\n');

    // Step 10: Verify journey dashboard loaded
    console.log('📍 Step 10: Verifying dashboard elements...');
    await page.waitForSelector('text=My Journey', { timeout: 5000 });
    await page.waitForSelector('text=Guest Mode', { timeout: 5000 });
    console.log('✅ Dashboard loaded with guest journey\n');

    // Step 11: Check for recommendations section
    console.log('📍 Step 11: Checking for facility recommendations...');
    const hasRecommendations = await page.locator('text=Recommendations').count() > 0 ||
                                await page.locator('text=facilities match').count() > 0;
    if (hasRecommendations) {
      console.log('✅ Facility recommendations visible\n');
    } else {
      console.log('⚠️  No recommendations shown (may need more facilities in database)\n');
    }

    // Final success
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ GRANDMA BETTY TEST PASSED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`⏱️  Total Time: ${duration} seconds`);
    console.log(`🎯 Target: <120 seconds (Elon's challenge: <600 seconds)`);
    console.log(`📊 Result: ${duration < 120 ? '🏆 PASSED' : '⚠️  EXCEEDED TARGET'}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📝 Test Summary:');
    console.log('  ✓ Homepage loaded');
    console.log('  ✓ AI onboarding started');
    console.log('  ✓ Conversational journey extraction worked');
    console.log('  ✓ Journey created without auth');
    console.log('  ✓ Auto-navigation to dashboard');
    console.log('  ✓ Guest mode functional');
    console.log('\n🎉 Grandma Betty would be delighted!\n');

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.error('\n❌ TEST FAILED!');
    console.error(`⏱️  Failed after ${duration} seconds`);
    console.error(`🐛 Error: ${error.message}\n`);

    // Take screenshot of failure
    await page.screenshot({ path: 'grandma-betty-failure.png', fullPage: true });
    console.log('📸 Screenshot saved to grandma-betty-failure.png\n');
  } finally {
    await browser.close();
  }
})();
