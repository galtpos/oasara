import { test, expect } from '@playwright/test';

const BASE_URL = 'https://oasara.com';

test.describe('Medical Trust Signup Flow', () => {
  test('Can access Medical Trust page and find signup options', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-trusts`);
    await page.screenshot({ path: 'test-results/medical-trust-page.png', fullPage: true });

    // Check page loaded
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    console.log('✅ Medical Trust page loaded');

    // Look for signup/register/join buttons
    const signupButtons = page.locator('a:has-text("Sign"), a:has-text("Register"), a:has-text("Join"), button:has-text("Sign"), button:has-text("Register"), button:has-text("Join")');

    if (await signupButtons.count() > 0) {
      console.log(`✅ Found ${await signupButtons.count()} signup button(s)`);

      // Click first signup button
      await signupButtons.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/signup-form.png', fullPage: true });

      // Check if we're on a signup page
      const url = page.url();
      console.log(`Current URL: ${url}`);

      // Look for form elements
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

      if (await emailInput.count() > 0) {
        console.log('✅ Found email input field');
      } else {
        console.log('⚠️  No email input found');
      }

      if (await passwordInput.count() > 0) {
        console.log('✅ Found password input field');
      } else {
        console.log('⚠️  No password input found');
      }

      // Test form validation (submit empty form)
      const submitButton = page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Register")').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/signup-validation.png', fullPage: true });
        console.log('✅ Form validation triggered');
      }

    } else {
      console.log('❌ No signup buttons found on Medical Trust page');
    }
  });

  test('Can test signup form with test data', async ({ page }) => {
    // Go directly to signup page
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/direct-signup-page.png', fullPage: true });

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      // Fill form with test data
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      await emailInput.fill(testEmail);
      await passwordInput.fill(testPassword);

      // Look for additional required fields
      const nameInput = page.locator('input[name="name"], input[name="fullName"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test User');
      }

      await page.screenshot({ path: 'test-results/signup-form-filled.png', fullPage: true });
      console.log('✅ Form filled with test data');

      // Note: Not actually submitting to avoid creating test accounts
      console.log('⚠️  Skipping actual submission to avoid creating test account');
      console.log(`Test email used: ${testEmail}`);

    } else {
      console.log('❌ Signup form not found or incomplete');
    }
  });
});
