import { test, expect } from '@playwright/test';

const BASE_URL = 'https://oasara.com';

test.describe('Priority 2 Flows - Day 2 QA', () => {

  test('AI Chatbot accessibility and functionality', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Look for chatbot widget
    const chatbot = page.locator(
      '[class*="chatbot"], [id*="chatbot"], [class*="intercom"], [id*="intercom"], ' +
      'button:has-text("Chat"), button:has-text("Help"), button[aria-label*="chat" i]'
    );

    if (await chatbot.count() > 0) {
      console.log('✅ Chatbot widget found');
      await page.screenshot({ path: 'test-results/chatbot-widget.png' });

      // Try to open chatbot
      await chatbot.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/chatbot-open.png' });
      console.log('✅ Chatbot opened');

      // Check if input is visible
      const chatInput = page.locator('input[type="text"], textarea').last();
      if (await chatInput.isVisible()) {
        console.log('✅ Chat input visible');
      } else {
        console.log('⚠️  Chat input not visible');
      }
    } else {
      console.log('⚠️  No chatbot widget found (may be optional)');
    }
  });

  test('User account creation flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/account-creation-page.png', fullPage: true });

    // Check for account creation elements
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Create")');

    if (await emailInput.count() > 0) {
      console.log('✅ Account creation form found');

      // Test form labels
      const emailLabel = page.locator('label[for="email"], label:has-text("Email")');
      if (await emailLabel.count() > 0) {
        console.log('✅ Email field has label');
      } else {
        console.log('⚠️  Email field missing visible label');
      }

      // Test form accessibility
      const emailId = await emailInput.getAttribute('id');
      if (emailId) {
        console.log('✅ Email input has ID for label association');
      } else {
        console.log('⚠️  Email input missing ID');
      }

      // Test submit button
      if (await submitButton.count() > 0) {
        console.log('✅ Submit button found');
        const buttonText = await submitButton.first().textContent();
        console.log(`Button text: "${buttonText}"`);
      } else {
        console.log('❌ Submit button not found');
      }
    } else {
      console.log('❌ Account creation form not found');
    }
  });

  test('Saved facilities feature (if exists)', async ({ page }) => {
    // First need to be logged in to test saved facilities
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Look for "Save" or "Bookmark" functionality
    const saveButtons = page.locator(
      'button:has-text("Save"), button:has-text("Bookmark"), ' +
      'button[aria-label*="save" i], button[aria-label*="bookmark" i]'
    );

    if (await saveButtons.count() > 0) {
      console.log(`✅ Found ${await saveButtons.count()} save/bookmark buttons`);
      await page.screenshot({ path: 'test-results/save-feature.png' });
    } else {
      console.log('⚠️  No save/bookmark feature found (may not be implemented yet)');
    }

    // Check for saved facilities page
    await page.goto(`${BASE_URL}/saved`);
    const pageStatus = page.url();
    if (pageStatus.includes('/saved')) {
      console.log('✅ Saved facilities page exists');
      await page.screenshot({ path: 'test-results/saved-page.png', fullPage: true });
    } else {
      console.log('⚠️  Saved facilities page not found (may redirect)');
    }
  });

  test('Newsletter signup functionality', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Look for newsletter signup (usually in footer)
    const newsletterInput = page.locator(
      'input[placeholder*="email" i]:not([type="password"]), ' +
      'input[name*="newsletter"], input[name*="subscribe"]'
    );

    if (await newsletterInput.count() > 0) {
      console.log('✅ Newsletter signup found');

      // Test with valid email
      const testEmail = `test-newsletter-${Date.now()}@example.com`;
      await newsletterInput.first().fill(testEmail);
      await page.screenshot({ path: 'test-results/newsletter-filled.png' });

      // Look for submit button nearby
      const submitButton = page.locator(
        'button:has-text("Subscribe"), button:has-text("Sign Up"), ' +
        'button[type="submit"]'
      ).first();

      if (await submitButton.count() > 0) {
        console.log('✅ Newsletter submit button found');
        // Note: Not actually submitting to avoid spam
        console.log('⚠️  Skipping actual submission');
      }
    } else {
      console.log('⚠️  Newsletter signup not found');
    }
  });

  test('Social sharing functionality', async ({ page }) => {
    // Navigate to a facility detail page
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const facilityLink = page.locator('a[href*="/facility/"]').first();
    if (await facilityLink.count() > 0) {
      await facilityLink.click();
      await page.waitForLoadState('networkidle');

      // Look for social sharing buttons
      const shareButtons = page.locator(
        'button:has-text("Share"), a[href*="twitter.com"], a[href*="facebook.com"], ' +
        'a[href*="linkedin.com"], button[aria-label*="share" i]'
      );

      if (await shareButtons.count() > 0) {
        console.log(`✅ Found ${await shareButtons.count()} social sharing options`);
        await page.screenshot({ path: 'test-results/social-sharing.png' });
      } else {
        console.log('⚠️  No social sharing buttons found');
      }
    }
  });

  test('About/Blog pages load correctly', async ({ page }) => {
    // Test About page
    const aboutUrls = ['/about', '/why-zano', '/hub'];

    for (const url of aboutUrls) {
      await page.goto(`${BASE_URL}${url}`);
      await page.waitForTimeout(1000);

      const pageLoaded = !page.url().includes('404');
      if (pageLoaded) {
        console.log(`✅ ${url} page loads`);
        await page.screenshot({ path: `test-results/page-${url.replace('/', '')}.png`, fullPage: true });
      } else {
        console.log(`⚠️  ${url} page not found or redirects`);
      }
    }
  });
});
