// Grandma Betty User Test - Real person trying to find a facility for breast augmentation
// Simulates someone who is NOT tech-savvy, just wants to find a safe, affordable facility

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  console.log('\n=== GRANDMA BETTY USER TEST ===');
  console.log('Goal: Find a safe, affordable facility for breast augmentation\n');

  try {
    // Step 1: Land on site
    console.log('1. Going to oasara.com/my-journey...');
    await page.goto('https://oasara.com/my-journey', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-screenshots/01-landing.png', fullPage: true });
    console.log('✅ Page loaded\n');

    // Step 2: Start wizard
    console.log('2. Looking for "Start New Journey" button...');
    const startButton = page.locator('button:has-text("Start New Journey")').first();
    await startButton.waitFor({ timeout: 5000 });
    await startButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/02-wizard-start.png', fullPage: true });
    console.log('✅ Wizard opened\n');

    // Step 3: Select procedure (Breast Augmentation)
    console.log('3. Selecting "Breast Augmentation"...');
    await page.waitForTimeout(1000);
    const breastButton = page.locator('button:has-text("Breast Augmentation")').first();
    await breastButton.waitFor({ timeout: 5000 });
    await breastButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/03-procedure-selected.png', fullPage: true });
    console.log('✅ Procedure selected\n');

    // Step 4: Set budget ($5k-$15k)
    console.log('4. Setting budget to $5,000 - $15,000...');
    await page.waitForTimeout(1000);
    // Click Next to go to budget step
    const nextButton1 = page.locator('button:has-text("Next")').first();
    await nextButton1.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/04-budget-step.png', fullPage: true });
    console.log('✅ Budget step loaded\n');

    // Step 5: Select timeline
    console.log('5. Selecting timeline "Soon (1-3 months)"...');
    await page.waitForTimeout(1000);
    const nextButton2 = page.locator('button:has-text("Next")').first();
    await nextButton2.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-screenshots/05-timeline-step.png', fullPage: true });
    
    const soonButton = page.locator('button:has-text("Soon")').first();
    await soonButton.waitFor({ timeout: 5000 });
    await soonButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Timeline selected\n');

    // Step 6: Complete wizard
    console.log('6. Clicking "Complete Journey" button...');
    const completeButton = page.locator('button:has-text("Complete Journey")').first();
    await completeButton.waitFor({ timeout: 5000 });
    await completeButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/06-journey-dashboard.png', fullPage: true });
    console.log('✅ Landed on journey dashboard\n');

    // Step 7: Try to find facilities - click "Ask AI" button
    console.log('7. Grandma Betty sees "Ask AI for Recommendations" button...');
    await page.waitForTimeout(1000);
    const askAIButton = page.locator('button:has-text("Ask AI for Recommendations")').first();
    await askAIButton.waitFor({ timeout: 5000 });
    
    console.log('   Betty clicks it expecting to see facilities...');
    await askAIButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/07-after-ask-ai-click.png', fullPage: true });
    
    // Check if chatbot opened
    const chatbotOpen = await page.locator('[data-chatbot-toggle][data-is-open="true"]').count() > 0;
    if (chatbotOpen) {
      console.log('✅ CHATBOT OPENED!\n');
      await page.screenshot({ path: 'test-screenshots/08-chatbot-opened.png', fullPage: true });
      
      // Try asking a question
      console.log('8. Betty asks: "Which facility is safest?"');
      const chatInput = page.locator('input[placeholder*="Ask"]').first();
      await chatInput.fill('Which facility is safest?');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-screenshots/09-question-typed.png', fullPage: true });
      
      const sendButton = page.locator('button[type="submit"], button:has(svg)').last();
      await sendButton.click();
      console.log('   Waiting for AI response...');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-screenshots/10-ai-response.png', fullPage: true });
      console.log('✅ AI responded!\n');
    } else {
      console.log('❌ CHATBOT DID NOT OPEN - Button click failed!\n');
    }

    console.log('\n=== TEST COMPLETE ===');
    console.log('Screenshots saved to test-screenshots/');
    console.log('Review images to see actual user experience.\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    await page.screenshot({ path: 'test-screenshots/ERROR.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
