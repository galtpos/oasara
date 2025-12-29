const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('\n=== SIMPLE USER TEST ===\n');

  try {
    console.log('1. Loading oasara.com/my-journey...');
    await page.goto('https://oasara.com/my-journey', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/page-loaded.png', fullPage: true });
    console.log('✅ Page loaded\n');

    // Get all visible text on page
    console.log('2. Finding all buttons...');
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons:`);
    for (const button of buttons) {
      const text = await button.textContent().catch(() => '');
      if (text.trim()) {
        console.log(`   - "${text.trim()}"`);
      }
    }

    console.log('\n3. Looking for "Ask AI" button...');
    const askAIButton = await page.locator('button:has-text("Ask AI")').count();
    console.log(`Found ${askAIButton} "Ask AI" buttons\n`);

    if (askAIButton > 0) {
      console.log('4. Clicking first "Ask AI" button...');
      await page.locator('button:has-text("Ask AI")').first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-screenshots/after-click.png', fullPage: true });
      
      // Check if chatbot visible
      const chatVisible = await page.locator('.fixed.bottom-6.right-6').isVisible().catch(() => false);
      console.log(`Chatbot visible: ${chatVisible}\n`);
    }

    console.log('5. Waiting 5 seconds for manual inspection...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    await page.screenshot({ path: 'test-screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
