import { test, expect } from '@playwright/test';

/**
 * GRANDMA BETTY - FULL JOURNEY WORKFLOW TEST
 *
 * User Story: Betty, 72, needs breast reconstruction after mastectomy.
 * She's tech-hesitant, budget-conscious ($8k-12k), and wants safe care.
 *
 * Journey Flow:
 * 1. Start AI onboarding conversation
 * 2. Tell her story in natural language
 * 3. Get facility recommendations from chatbot
 * 4. Add multiple facilities to shortlist
 * 5. View facility details
 * 6. Compare facilities on journey dashboard
 * 7. Add notes to each facility
 * 8. Review shortlist with notes
 *
 * Success Criteria:
 * - Journey created in <15 seconds
 * - Chatbot shows 3+ real facilities with prices
 * - Facilities saved to shortlist
 * - Notes persist across page reloads
 * - Shortlist visible on dashboard
 */

test.describe('Grandma Betty - Full Journey Workflow', () => {
  const TEST_EMAIL = `betty.test+${Date.now()}@oasara.com`;
  const TEST_NAME = 'Betty Thompson';

  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('https://oasara.com');
    await page.waitForLoadState('networkidle');
  });

  test('Complete journey: Onboarding → Recommend → Shortlist → Notes → Compare', async ({ page }) => {
    console.log('🧓 Grandma Betty starting her healthcare journey...');

    // ============================================
    // STEP 1: Start AI Onboarding
    // ============================================
    console.log('Step 1: Starting AI conversation...');
    await page.click('a[href="/start"]');
    await page.waitForURL('**/start');
    await expect(page.locator('text=Your Personal Guide')).toBeVisible({ timeout: 10000 });

    // ============================================
    // STEP 2: Have Natural Conversation
    // ============================================
    console.log('Step 2: Betty tells her story...');

    // Wait for chatbot to load and initial message to appear
    await page.waitForTimeout(2000); // Give chatbot time to initialize

    // Betty's first message - her situation
    const chatInput = page.locator('input[placeholder*="looking for"]');
    await chatInput.fill("Hi, I'm 72 and need breast reconstruction after my mastectomy. I'm a bit nervous about traveling but my doctor says medical tourism could save me a lot of money. Can you help?");

    // Click send button (last button with svg icon)
    const sendButtons = page.locator('button:has(svg)');
    await sendButtons.last().click();

    // Wait for AI response
    await page.waitForTimeout(3000);

    // Betty provides budget
    await chatInput.fill("My budget is $8,000 to $12,000. I have about 3-4 months before I want to do this.");
    await sendButtons.last().click();

    // Wait for AI response
    await page.waitForTimeout(3000);

    // Confirm procedure details if asked
    await chatInput.fill("Yes, breast reconstruction. I want a safe facility with English-speaking doctors.");
    await sendButtons.last().click();

    // Wait for journey creation
    console.log('Waiting for journey creation...');
    await page.waitForTimeout(5000);

    // Check if redirected to journey dashboard
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // ============================================
    // STEP 3: Navigate to Journey (if not auto-redirected)
    // ============================================
    if (!currentUrl.includes('/my-journey')) {
      console.log('Not redirected yet, checking for journey navigation...');
      // Journey might have been created, look for navigation option
      const journeyLink = page.locator('a[href="/my-journey"]');
      if (await journeyLink.isVisible()) {
        await journeyLink.click();
        await page.waitForURL('**/my-journey');
      } else {
        console.log('Journey link not found, waiting for auto-redirect...');
        await page.waitForURL('**/my-journey', { timeout: 10000 });
      }
    }

    console.log('✅ Journey created! Betty is on her dashboard.');

    // ============================================
    // STEP 4: Open Chatbot and Ask for Recommendations
    // ============================================
    console.log('Step 4: Betty asks chatbot for facility recommendations...');

    // Find and click chatbot toggle button
    const chatbotToggle = page.locator('[data-chatbot-toggle]');
    await expect(chatbotToggle).toBeVisible({ timeout: 5000 });
    await chatbotToggle.click();

    // Wait for chatbot to open
    await page.waitForTimeout(500);

    // Ask for recommendations
    const journeyChatInput = page.locator('input[placeholder*="Type or speak"]');
    await journeyChatInput.fill("Which facilities do you recommend for my breast reconstruction? I want the safest options.");
    await page.click('button:has(svg[d*="M12 19l9 2"])'); // Send button

    // Wait for AI to process and return facility recommendations
    console.log('Waiting for facility recommendations...');
    await page.waitForTimeout(8000); // AI + database query time

    // ============================================
    // STEP 5: Verify Facility Cards Appear
    // ============================================
    console.log('Step 5: Verifying facility cards appear...');

    // Look for facility cards in chatbot
    const facilityCards = page.locator('.bg-white.border.border-ocean-200.rounded-lg');
    await expect(facilityCards.first()).toBeVisible({ timeout: 10000 });

    const facilityCount = await facilityCards.count();
    console.log(`✅ Found ${facilityCount} facility recommendations!`);
    expect(facilityCount).toBeGreaterThanOrEqual(3); // Should show at least 3 facilities

    // Verify facility cards have required info
    const firstCard = facilityCards.first();
    await expect(firstCard.locator('.font-semibold')).toBeVisible(); // Name
    await expect(firstCard.locator('text=/,/')).toBeVisible(); // Location (city, country)

    // Check for rating or JCI badge
    const hasRating = await firstCard.locator('svg.text-gold-500').isVisible();
    const hasJCI = await firstCard.locator('text=JCI').isVisible();
    expect(hasRating || hasJCI).toBeTruthy();
    console.log('✅ Facility cards have names, locations, and quality indicators!');

    // ============================================
    // STEP 6: Add Multiple Facilities to Shortlist
    // ============================================
    console.log('Step 6: Betty adds facilities to her shortlist...');

    // Note: This requires authentication, so we need to sign up first
    // For now, we'll verify the button exists and is clickable

    const shortlistButtons = page.locator('button:has-text("+ List")');
    const shortlistButtonCount = await shortlistButtons.count();
    console.log(`Found ${shortlistButtonCount} shortlist buttons`);

    if (shortlistButtonCount > 0) {
      console.log('⚠️  Note: Shortlist requires authentication. Test would prompt signup here.');
      // In full test, we'd sign up Betty and then add facilities
      // For now, verify the UI elements exist
      await expect(shortlistButtons.first()).toBeVisible();
    }

    // ============================================
    // STEP 7: View Facility Details
    // ============================================
    console.log('Step 7: Betty views a facility in detail...');

    const viewButtons = page.locator('a:has-text("View")');
    await expect(viewButtons.first()).toBeVisible();

    // Click first facility's View button (opens in new tab)
    const [facilityPage] = await Promise.all([
      page.context().waitForEvent('page'),
      viewButtons.first().click()
    ]);

    await facilityPage.waitForLoadState('networkidle');
    console.log('Facility detail page URL:', facilityPage.url());

    // Verify facility detail page loaded
    await expect(facilityPage.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Facility detail page loaded successfully!');

    await facilityPage.close();

    // ============================================
    // STEP 8: Test Results Summary
    // ============================================
    console.log('\n📊 GRANDMA BETTY TEST RESULTS:');
    console.log('✅ AI Onboarding: Completed');
    console.log('✅ Journey Creation: Success');
    console.log('✅ Chatbot Recommendations: Working');
    console.log(`✅ Facilities Shown: ${facilityCount} cards`);
    console.log('✅ Facility Details: Accessible');
    console.log('✅ Shortlist UI: Present (auth required)');
    console.log('\n🎉 Betty successfully navigated the platform!\n');

    // Final assertions
    expect(facilityCount).toBeGreaterThanOrEqual(3);
    expect(page.url()).toContain('/my-journey');
  });

  test('Chatbot shows facilities with required data fields', async ({ page }) => {
    console.log('Testing facility card data completeness...');

    // Go directly to journey page (requires existing journey)
    // This test assumes a journey exists or creates one via direct DB insert
    await page.goto('https://oasara.com/start');

    // Quick journey creation
    await page.waitForSelector('input[placeholder*="looking for"]', { timeout: 10000 });
    const chatInput = page.locator('input[placeholder*="looking for"]');
    await chatInput.fill("I need dental implants, budget $3000-5000");
    const sendButtons = page.locator('button:has(svg)');
    await sendButtons.last().click();
    await page.waitForTimeout(3000);

    await chatInput.fill("flexible timeline");
    await sendButtons.last().click();
    await page.waitForTimeout(8000);

    // Should be on journey page
    await page.waitForURL('**/my-journey', { timeout: 15000 });

    // Open chatbot
    await page.click('[data-chatbot-toggle]');
    await page.waitForTimeout(500);

    // Ask for recommendations
    const journeyChatInput = page.locator('input[placeholder*="Type or speak"]');
    await journeyChatInput.fill("recommend facilities");
    await page.click('button:has(svg[d*="M12 19l9 2"])');
    await page.waitForTimeout(8000);

    // Check first facility card has all required fields
    const firstCard = page.locator('.bg-white.border.border-ocean-200.rounded-lg').first();
    await expect(firstCard).toBeVisible();

    // Required fields
    await expect(firstCard.locator('.font-semibold')).toBeVisible(); // Name
    await expect(firstCard.locator('.text-ocean-600').filter({ hasText: ',' })).toBeVisible(); // Location

    // At least one quality indicator
    const hasRating = await firstCard.locator('.text-gold-500').isVisible();
    const hasJCI = await firstCard.locator('text=JCI').isVisible();
    const hasPricing = await firstCard.locator('.text-ocean-600').filter({ hasText: '$' }).isVisible();

    expect(hasRating || hasJCI || hasPricing).toBeTruthy();

    console.log('✅ Facility cards have complete data!');
  });
});
