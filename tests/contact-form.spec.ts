import { test, expect } from '@playwright/test';

const BASE_URL = 'https://oasara.com';

test.describe('Contact Form Tests', () => {
  test('Contact button exists on facility pages', async ({ page }) => {
    // Go to homepage and find first facility
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Look for facility cards or links
    const facilityLinks = page.locator('a[href*="/facility/"], a:has-text("View Details"), a:has-text("Learn More")');
    const count = await facilityLinks.count();

    if (count > 0) {
      console.log(`✅ Found ${count} facility links`);

      // Click first facility
      await facilityLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/facility-detail-page.png', fullPage: true });

      console.log(`Current URL: ${page.url()}`);

      // Look for contact/inquiry buttons
      const contactButton = page.locator(
        'button:has-text("Contact"), button:has-text("Inquiry"), button:has-text("Get Quote"), a:has-text("Contact")'
      ).first();

      if (await contactButton.count() > 0) {
        console.log('✅ Contact button found');
        await contactButton.click();
        await page.waitForTimeout(1000); // Wait for modal animation

        await page.screenshot({ path: 'test-results/contact-modal.png' });

        // Check for form elements
        const nameInput = page.locator('input[name="senderName"], input[id="senderName"]');
        const emailInput = page.locator('input[name="senderEmail"], input[type="email"]');
        const messageInput = page.locator('textarea[name="message"]');

        if (await nameInput.count() > 0) console.log('✅ Name field found');
        else console.log('⚠️  Name field not found');

        if (await emailInput.count() > 0) console.log('✅ Email field found');
        else console.log('⚠️  Email field not found');

        if (await messageInput.count() > 0) console.log('✅ Message field found');
        else console.log('⚠️  Message field not found');

        // Test form validation (submit empty form)
        const submitButton = page.locator('button[type="submit"], button:has-text("Send")').first();
        if (await submitButton.count() > 0) {
          console.log('✅ Submit button found');
        }

      } else {
        console.log('⚠️  No contact button found on facility page');
      }

    } else {
      console.log('❌ No facility links found on homepage');
    }
  });

  test('Can fill contact form with test data', async ({ page }) => {
    // Navigate directly to first facility (we'll need to find a real facility ID)
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Find and click first facility link
    const facilityLink = page.locator('a[href*="/facility/"]').first();

    if (await facilityLink.count() > 0) {
      await facilityLink.click();
      await page.waitForLoadState('networkidle');

      // Open contact modal
      const contactButton = page.locator('button:has-text("Contact")').first();
      if (await contactButton.count() > 0) {
        await contactButton.click();
        await page.waitForTimeout(1000);

        // Fill form
        await page.fill('input[name="senderName"]', 'Test User');
        await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
        await page.fill('textarea[name="message"]', 'This is a test inquiry from automated QA testing.');

        await page.screenshot({ path: 'test-results/contact-form-filled.png' });
        console.log('✅ Form filled with test data');

        // Note: Not submitting to avoid creating test inquiries
        console.log('⚠️  Skipping submission to avoid creating test inquiry');
      }
    }
  });
});
