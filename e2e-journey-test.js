const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 800,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null,
    recordVideo: { dir: 'test-videos/' }
  });
  
  const page = await context.newPage();

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   OASARA E2E TEST - PATIENT JOURNEY    ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Step 1: Go to homepage
    console.log('📍 Step 1: Loading oasara.com...');
    await page.goto('https://oasara.com', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-screenshots/01-homepage.png', fullPage: true });
    console.log('✅ Homepage loaded\n');

    // Step 2: Click "My Journey" in header
    console.log('📍 Step 2: Clicking "My Journey" in header...');
    await page.click('a[href="/my-journey"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/02-my-journey-page.png', fullPage: true });
    console.log('✅ My Journey page loaded\n');

    // Check if we need to auth
    const needsAuth = await page.locator('button:has-text("Send Magic Link")').count() > 0;
    
    if (needsAuth) {
      console.log('🔐 Authentication required. Enter email manually and complete auth.\n');
      console.log('⏸️  Pausing for 30 seconds - please authenticate in the browser window...\n');
      await page.waitForTimeout(30000);
      await page.screenshot({ path: 'test-screenshots/03-after-auth.png', fullPage: true });
    }

    // Step 3: Start New Journey
    console.log('📍 Step 3: Looking for "Start New Journey" button...');
    const startJourney = page.locator('button:has-text("Start New Journey"), a:has-text("Start New Journey")').first();
    await startJourney.waitFor({ timeout: 10000 });
    await startJourney.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/04-wizard-opened.png', fullPage: true });
    console.log('✅ Wizard opened\n');

    // Step 4: Select Procedure
    console.log('📍 Step 4: Selecting "Breast Augmentation"...');
    const breastAug = page.locator('button:has-text("Breast Augmentation"), div:has-text("Breast Augmentation")').first();
    await breastAug.waitFor({ timeout: 5000 });
    await breastAug.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-screenshots/05-procedure-selected.png', fullPage: true });
    console.log('✅ Procedure selected\n');

    // Step 5: Next to Budget
    console.log('📍 Step 5: Moving to budget step...');
    await page.locator('button:has-text("Next")').first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-screenshots/06-budget-step.png', fullPage: true });
    console.log('✅ Budget step loaded\n');

    // Step 6: Next to Timeline
    console.log('📍 Step 6: Moving to timeline step...');
    await page.locator('button:has-text("Next")').first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-screenshots/07-timeline-step.png', fullPage: true });

    // Select "Soon"
    console.log('📍 Step 7: Selecting "Soon" timeline...');
    const soon = page.locator('button:has-text("Soon")').first();
    await soon.click();
    await page.waitForTimeout(1000);
    console.log('✅ Timeline selected\n');

    // Step 8: Complete Journey
    console.log('📍 Step 8: Completing journey...');
    await page.locator('button:has-text("Complete Journey")').first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-screenshots/08-dashboard-landed.png', fullPage: true });
    console.log('✅ Dashboard loaded\n');

    // Step 9: THE CRITICAL TEST - Click "Ask AI for Recommendations"
    console.log('📍 Step 9: THE BIG TEST - Clicking "Ask AI for Recommendations"...');
    await page.waitForTimeout(1000);
    
    const askAIButton = page.locator('button:has-text("Ask AI for Recommendations")').first();
    await askAIButton.waitFor({ timeout: 5000 });
    
    console.log('   🖱️  Clicking button now...');
    await askAIButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-screenshots/09-after-ask-ai-click.png', fullPage: true });

    // Check if chatbot opened
    const chatbotVisible = await page.locator('.fixed.bottom-6.right-6').isVisible();
    const chatWindow = await page.locator('div:has-text("Oasara Assistant")').count();
    
    if (chatbotVisible && chatWindow > 0) {
      console.log('✅ ✅ ✅ CHATBOT OPENED SUCCESSFULLY! ✅ ✅ ✅\n');
      await page.screenshot({ path: 'test-screenshots/10-chatbot-opened-SUCCESS.png', fullPage: true });
      
      // Step 10: Ask a question
      console.log('📍 Step 10: Asking AI: "Which facility is safest for breast augmentation?"');
      const input = page.locator('input[placeholder*="Ask"], textarea[placeholder*="Ask"]').first();
      await input.fill('Which facility is safest for breast augmentation?');
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'test-screenshots/11-question-typed.png', fullPage: true });
      
      // Send message
      console.log('   📤 Sending message...');
      const sendBtn = page.locator('button[type="submit"], button:has(svg[viewBox="0 0 24 24"])').last();
      await sendBtn.click();
      
      console.log('   ⏳ Waiting for AI response...');
      await page.waitForTimeout(8000);
      await page.screenshot({ path: 'test-screenshots/12-ai-response-received.png', fullPage: true });
      
      // Check if we got a response
      const messages = await page.locator('div[class*="rounded-2xl"]').count();
      if (messages > 2) {
        console.log('✅ AI RESPONDED! Chat is working!\n');
      } else {
        console.log('❌ No AI response detected\n');
      }
      
    } else {
      console.log('❌ ❌ ❌ CHATBOT DID NOT OPEN ❌ ❌ ❌\n');
      console.log('   Button was clicked but chatbot did not appear.');
      console.log('   This is the bug the user reported.\n');
    }

    // Step 11: Test recommendations section
    console.log('📍 Step 11: Checking for recommendations section...');
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(1000);
    const recommendations = await page.locator('h3:has-text("Recommended for")').count();
    if (recommendations > 0) {
      console.log('✅ Recommendations section visible\n');
      await page.screenshot({ path: 'test-screenshots/13-recommendations-visible.png', fullPage: true });
    } else {
      console.log('⚠️  No recommendations visible (might need facilities in shortlist)\n');
    }

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║          TEST COMPLETE!                ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log('📸 Screenshots saved to: test-screenshots/');
    console.log('🎥 Video saved to: test-videos/\n');

    // Keep browser open for 10 seconds
    console.log('⏳ Keeping browser open for 10 seconds for inspection...\n');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await page.screenshot({ path: 'test-screenshots/ERROR-final.png', fullPage: true });
    console.error('\n📸 Error screenshot saved\n');
  } finally {
    await context.close();
    await browser.close();
  }
})();
