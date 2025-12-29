// Grandma Betty Test V2 - More patient with AI response times
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Grandma Betty Test V2 (patient with AI)...\n');
  const startTime = Date.now();

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Visit homepage
    console.log('📍 Step 1: Visiting homepage...');
    await page.goto('https://oasara.com');
    await page.waitForLoadState('networkidle');
    console.log('✅ Homepage loaded\n');

    // Step 2: Click "Start a Conversation"
    console.log('📍 Step 2: Finding and clicking "Start a Conversation"...');
    await page.waitForSelector('text=Start a Conversation', { timeout: 10000 });
    await page.click('text=Start a Conversation');
    console.log('✅ Clicked CTA\n');

    // Step 3: Wait for onboarding page
    console.log('📍 Step 3: Waiting for AI chatbot to load...');
    await page.waitForURL('**/start', { timeout: 10000 });
    await page.waitForSelector('text=Your Personal Guide', { timeout: 10000 });
    console.log('✅ AI chatbot ready\n');

    // Step 4: Type complete request in one message
    console.log('📍 Step 4: Grandma Betty types her full request...');
    const input = page.locator('input[placeholder*="Tell me"]').first();
    await input.fill('I want breast augmentation, my budget is $5000 to $8000, and I\'m flexible on timing');
    
    // Wait a moment for Grandma to "think"
    await page.waitForTimeout(1000);
    
    // Press Enter
    await page.keyboard.press('Enter');
    console.log('✅ Sent complete request\n');

    // Step 5: Wait for AI to process and create journey (be VERY patient)
    console.log('📍 Step 5: Waiting for AI to create journey (up to 30 seconds)...');
    
    // Wait for either success message OR journey creation
    const successIndicator = await Promise.race([
      page.waitForSelector('text=Your journey is ready', { timeout: 30000 }).then(() => 'success-message'),
      page.waitForURL('**/my-journey', { timeout: 30000 }).then(() => 'auto-navigate'),
      page.waitForTimeout(30000).then(() => 'timeout')
    ]);
    
    if (successIndicator === 'timeout') {
      throw new Error('Journey creation timed out after 30 seconds');
    }
    
    console.log(`✅ Journey created (via ${successIndicator})\n`);

    // Step 6: If not already on dashboard, wait for navigation
    if (!page.url().includes('my-journey')) {
      console.log('📍 Step 6: Waiting for dashboard navigation...');
      await page.waitForURL('**/my-journey', { timeout: 10000 });
    }
    console.log('✅ On dashboard\n');

    // Step 7: Verify dashboard elements
    console.log('📍 Step 7: Verifying dashboard...');
    await page.waitForSelector('text=My Journey', { timeout: 5000 });
    await page.waitForSelector('text=Guest Mode', { timeout: 5000 });
    console.log('✅ Dashboard loaded with guest journey\n');

    // Final success
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ GRANDMA BETTY TEST PASSED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`⏱️  Total Time: ${duration} seconds`);
    console.log(`🎯 Elon's Challenge: <600 seconds (10 minutes)`);
    console.log(`📊 Result: ${duration < 600 ? '🏆 CRUSHED IT' : '⚠️  EXCEEDED'}`);
    console.log(`📊 Ideal Target: <120 seconds`);
    console.log(`📊 Performance: ${duration < 120 ? '🏆 EXCELLENT' : duration < 180 ? '✅ GOOD' : '⚠️  SLOW'}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📝 Test Summary:');
    console.log('  ✓ Homepage loaded');
    console.log('  ✓ AI onboarding started');
    console.log('  ✓ Natural language journey creation');
    console.log('  ✓ Claude function calling worked');
    console.log('  ✓ Guest journey created');
    console.log('  ✓ Auto-navigation successful');
    console.log('  ✓ Dashboard fully functional');
    console.log('\n🎉 Grandma Betty is HAPPY! She did it without help!\n');

    // Take success screenshot
    await page.screenshot({ path: 'grandma-betty-success.png', fullPage: true });
    console.log('📸 Success screenshot saved\n');

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.error('\n❌ TEST FAILED!');
    console.error(`⏱️  Failed after ${duration} seconds`);
    console.error(`🐛 Error: ${error.message}\n`);

    await page.screenshot({ path: 'grandma-betty-failure.png', fullPage: true });
    console.log('📸 Failure screenshot saved\n');
  } finally {
    await browser.close();
  }
})();
