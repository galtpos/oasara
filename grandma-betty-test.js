const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1200,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();

  console.log('\n👵 GRANDMA BETTY\'S MEDICAL TOURISM JOURNEY 👵\n');
  console.log('Betty is 68, not great with computers, needs breast reconstruction');
  console.log('after mastectomy. Doctor quoted $45,000 in USA. She heard about');
  console.log('medical tourism from her bridge club friend...\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    console.log('👵 Betty: "Okay, my grandson said to go to oasara.com/my-journey..."');
    console.log('    *types slowly in address bar*\n');
    await page.goto('https://oasara.com/my-journey', { timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-screenshots/betty-01-arrives.png', fullPage: true });

    // Check what's on the page
    const pageTitle = await page.title();
    console.log(`    Page loaded: "${pageTitle}"\n`);

    // Check if auth is needed
    const hasAuthForm = await page.locator('input[type="email"]').count() > 0;
    
    if (hasAuthForm) {
      console.log('👵 Betty: "Hmm, it wants my email? Is this safe?"');
      console.log('    *squints at screen*');
      console.log('    *gets reading glasses*\n');
      console.log('🔐 AUTHENTICATION WALL DETECTED\n');
      console.log('    Betty has to create an account before seeing ANYTHING.');
      console.log('    No "Browse as Guest" option visible.');
      console.log('    This might scare Betty away...\n');
      
      console.log('⏸️  Test paused: Auth required. Manual login needed.\n');
      console.log('    In a real scenario, Betty might:');
      console.log('    ❌ Get frustrated and leave');
      console.log('    ❌ Think it\'s a scam');
      console.log('    ❌ Call her grandson for help\n');
      
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-screenshots/betty-02-auth-wall.png', fullPage: true });
      
      console.log('🎬 CUTTING TO: Betty after auth (assume grandson helped)...\n');
      console.log('⏳ Waiting 25 seconds for manual authentication...\n');
      await page.waitForTimeout(25000);
    }

    // Now on dashboard or wizard
    console.log('👵 Betty: "Okay I\'m logged in... now what?"');
    await page.screenshot({ path: 'test-screenshots/betty-03-logged-in.png', fullPage: true });
    await page.waitForTimeout(2000);

    // Look for start button
    const hasStartButton = await page.locator('button:has-text("Start"), button:has-text("New Journey")').count() > 0;
    
    if (hasStartButton) {
      console.log('    Betty sees: "Start New Journey" button\n');
      console.log('👵 Betty: "Oh! That looks important."');
      console.log('    *clicks with mouse cursor slowly moving*\n');
      await page.locator('button:has-text("Start New Journey"), button:has-text("Start")').first().click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: 'test-screenshots/betty-04-wizard-opens.png', fullPage: true });
    }

    // Wizard Step 1: Procedure
    console.log('👵 Betty: "Breast Augmentation? No no... I need reconstruction..."');
    console.log('    *scrolls looking for her procedure*');
    console.log('    *can\'t find "reconstruction"*');
    console.log('    *clicks Breast Augmentation because it\'s closest*\n');
    
    const breastButton = page.locator('button:has-text("Breast"), div:has-text("Breast Augmentation")').first();
    if (await breastButton.count() > 0) {
      await breastButton.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'test-screenshots/betty-05-procedure-picked.png', fullPage: true });
      console.log('✅ Betty selected a procedure (even though it\'s not quite right)\n');
    }

    // Next button
    console.log('👵 Betty: "Next button... okay..."');
    await page.locator('button:has-text("Next")').first().click();
    await page.waitForTimeout(1800);
    await page.screenshot({ path: 'test-screenshots/betty-06-budget-step.png', fullPage: true });
    console.log('    Budget step loaded\n');

    console.log('👵 Betty: "Budget? Well, I can\'t afford $45,000... that\'s why I\'m here!"');
    console.log('    *leaves default selection*');
    await page.locator('button:has-text("Next")').first().click();
    await page.waitForTimeout(1800);
    await page.screenshot({ path: 'test-screenshots/betty-07-timeline-step.png', fullPage: true });

    // Timeline
    console.log('\n👵 Betty: "When do I want to do this? Well, soon I guess..."');
    const soonButton = page.locator('button:has-text("Soon")').first();
    if (await soonButton.count() > 0) {
      await soonButton.click();
      await page.waitForTimeout(1000);
      console.log('    *clicks "Soon"*\n');
    }

    // Complete
    console.log('👵 Betty: "Complete Journey... okay this is it!"');
    console.log('    *clicks*\n');
    await page.locator('button:has-text("Complete")').first().click();
    await page.waitForTimeout(3500);
    await page.screenshot({ path: 'test-screenshots/betty-08-dashboard-loaded.png', fullPage: true });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎯 CRITICAL MOMENT: Betty is on her dashboard\n');

    // Check what Betty sees
    const hasAskAI = await page.locator('button:has-text("Ask AI")').count() > 0;
    const hasRecommendations = await page.locator('h3:has-text("Recommended")').count() > 0;
    const hasEmptyState = await page.locator('text=No facilities').count() > 0;

    if (hasEmptyState) {
      console.log('👵 Betty: "No facilities to compare yet... what does that mean?"');
      console.log('    *confused look*\n');
    }

    if (hasAskAI) {
      console.log('👵 Betty sees a blue button: "Ask AI for Recommendations"');
      console.log('    Betty: "Oh! Like ChatGPT! My grandson showed me that!"');
      console.log('    *clicks excitedly*\n');
      
      await page.locator('button:has-text("Ask AI")').first().click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: 'test-screenshots/betty-09-after-clicking-ask-ai.png', fullPage: true });

      // Check if chatbot appeared
      const chatbotOpen = await page.locator('div:has-text("Oasara Assistant")').count() > 0;
      const chatVisible = await page.locator('.fixed.bottom-6.right-6 > div').isVisible().catch(() => false);

      if (chatbotOpen && chatVisible) {
        console.log('✅ ✅ ✅ SUCCESS! Chatbot window opened! ✅ ✅ ✅\n');
        console.log('👵 Betty: "Oh look! A chat thing appeared!"');
        console.log('    *reads welcome message*');
        console.log('    "Hi! I\'m your Oasara assistant..."\n');
        
        await page.screenshot({ path: 'test-screenshots/betty-10-chatbot-SUCCESS.png', fullPage: true });

        console.log('👵 Betty: "Okay let me ask it something..."');
        console.log('    *types slowly*\n');
        
        const input = page.locator('input[placeholder*="Ask"]').first();
        await input.fill('Which hospital is safest?');
        await page.waitForTimeout(1200);
        await page.screenshot({ path: 'test-screenshots/betty-11-typed-question.png', fullPage: true });

        console.log('👵 Betty: "Now how do I send this..."');
        console.log('    *looks for send button*');
        console.log('    *clicks the arrow*\n');
        
        await page.locator('button[type="submit"], button:has(svg)').last().click();
        console.log('👵 Betty: *waiting*');
        console.log('    "Is it thinking?"');
        await page.waitForTimeout(6000);
        await page.screenshot({ path: 'test-screenshots/betty-12-ai-answered.png', fullPage: true });

        const messageCount = await page.locator('div[class*="rounded"]').count();
        if (messageCount > 2) {
          console.log('\n✅ AI RESPONDED!\n');
          console.log('👵 Betty: "Oh wow! It gave me an answer!"');
          console.log('    *reads response carefully*');
          console.log('    *feels more confident about this website*\n');
        } else {
          console.log('\n❌ No response from AI\n');
          console.log('👵 Betty: "Hmm, nothing happened... is it broken?"');
          console.log('    *clicks again*');
          console.log('    *gets frustrated*\n');
        }

      } else {
        console.log('❌ ❌ ❌ CHATBOT DID NOT OPEN ❌ ❌ ❌\n');
        console.log('👵 Betty: "I clicked the button... nothing happened?"');
        console.log('    *clicks again*');
        console.log('    *still nothing*');
        console.log('    "Maybe my computer is broken..."');
        console.log('    *about to give up and call her doctor instead*\n');
      }
    } else {
      console.log('👵 Betty: "I don\'t see any Ask AI button..."');
      console.log('    *scrolls around looking*');
      console.log('    *getting confused*\n');
    }

    if (hasRecommendations) {
      console.log('📋 Betty also sees: "Recommended for Breast Augmentation"');
      console.log('    Some facility cards with prices');
      console.log('    Betty: "Okay these look like options..."');
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🏁 GRANDMA BETTY TEST COMPLETE\n');
    console.log('💭 Betty\'s Overall Experience:');
    console.log('   - Had to create account before seeing anything (friction)');
    console.log('   - Wizard was easy enough to follow');
    console.log('   - Dashboard showed her options');
    if (hasAskAI && chatVisible) {
      console.log('   - ✅ AI chatbot worked! This helps Betty feel guided');
      console.log('   - ✅ Much better than browsing a confusing map\n');
    } else {
      console.log('   - ❌ AI button didn\'t work - Betty feels lost');
      console.log('   - ❌ Would likely abandon and call her doctor\n');
    }

    console.log('⏳ Keeping browser open 10 seconds for review...\n');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n💥 ERROR GRANDMA BETTY ENCOUNTERED:\n');
    console.error(`   ${error.message}\n`);
    console.log('👵 Betty: "This website is broken. I\'m calling my doctor."');
    await page.screenshot({ path: 'test-screenshots/betty-ERROR.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
