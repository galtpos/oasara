import { test, expect } from '@playwright/test';

test.describe('Journey Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('https://oasara.com');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('creates journey via chat and redirects to dashboard', async ({ page }) => {
    // Step 1: Go to /start (onboarding chat)
    await page.goto('https://oasara.com/start');

    // Verify we're on the start page with the chatbot
    await expect(page.locator('text=What brings you here today')).toBeVisible({ timeout: 10000 });

    // Step 2: Type a message that provides all required info
    const inputField = page.locator('input[placeholder*="Tell me what"]');
    await expect(inputField).toBeVisible();

    await inputField.fill('I need a root canal. My budget is $2000 to $5000. I can do it in the next 3-6 months.');

    // Step 3: Click send
    const sendButton = page.locator('button').filter({ has: page.locator('svg path[d*="12 19l9 2-9-18"]') });
    await sendButton.click();

    // Step 4: Wait for AI response and journey creation
    // The AI should recognize we have all info and create the journey
    await expect(page.locator('text=Your journey is ready')).toBeVisible({ timeout: 60000 });

    // Step 5: Wait for redirect (2 second delay + navigation)
    await page.waitForURL('**/my-journey', { timeout: 15000 });

    // Step 6: Verify we're on dashboard (NOT /my-journey/chat)
    const currentUrl = page.url();
    expect(currentUrl).toBe('https://oasara.com/my-journey');
    expect(currentUrl).not.toContain('/my-journey/chat');

    // Step 7: Verify journey data is displayed
    // Check for procedure type
    await expect(page.locator('text=root canal').first()).toBeVisible({ timeout: 10000 });

    // Check localStorage has the journey
    const guestJourney = await page.evaluate(() => {
      return localStorage.getItem('oasara-guest-journey');
    });

    expect(guestJourney).not.toBeNull();
    const journeyData = JSON.parse(guestJourney!);
    expect(journeyData.procedure_type.toLowerCase()).toContain('root canal');

    console.log('✅ Journey created successfully');
    console.log('✅ Redirected to /my-journey (not /my-journey/chat)');
    console.log('✅ Journey data:', journeyData);
  });

  test('quick action triggers journey creation', async ({ page }) => {
    await page.goto('https://oasara.com/start');

    // Wait for chatbot to load
    await expect(page.locator('text=What brings you here today')).toBeVisible({ timeout: 10000 });

    // Click a quick action
    const quickAction = page.locator('button:has-text("I know what I need")');
    await quickAction.click();

    // Wait for AI response
    await expect(page.locator('.bg-sage-100').nth(1)).toBeVisible({ timeout: 30000 });

    // AI should ask follow-up questions, not create journey yet
    // This tests that AI properly gathers all required info
    const messages = await page.locator('.bg-sage-100').count();
    expect(messages).toBeGreaterThanOrEqual(2);

    console.log('✅ Quick action works, AI asks follow-up questions');
  });

  test('existing journey shows on dashboard', async ({ page }) => {
    // Manually create a journey in localStorage
    await page.goto('https://oasara.com');
    await page.evaluate(() => {
      const journey = {
        id: 'test-journey-123',
        procedure_type: 'dental implants',
        budget_min: 3000,
        budget_max: 8000,
        timeline: 'flexible',
        status: 'active',
        created_at: new Date().toISOString(),
        shortlisted_facilities: [],
        notes: []
      };
      localStorage.setItem('oasara-guest-journey', JSON.stringify(journey));
    });

    // Navigate to my-journey
    await page.goto('https://oasara.com/my-journey');

    // Should show dashboard with journey, NOT redirect to /start
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    expect(currentUrl).toBe('https://oasara.com/my-journey');

    // Should see the procedure type
    await expect(page.locator('text=dental implants').first()).toBeVisible({ timeout: 10000 });

    console.log('✅ Existing journey loads correctly on dashboard');
  });

  test('no journey redirects to /start', async ({ page }) => {
    // Ensure no journey exists
    await page.goto('https://oasara.com');
    await page.evaluate(() => {
      localStorage.removeItem('oasara-guest-journey');
    });

    // Try to access my-journey
    await page.goto('https://oasara.com/my-journey');

    // Should redirect to /start
    await page.waitForURL('**/start', { timeout: 10000 });

    const currentUrl = page.url();
    expect(currentUrl).toBe('https://oasara.com/start');

    console.log('✅ No journey correctly redirects to /start');
  });

  test('clicking My Journey nav after creating journey shows dashboard', async ({ page }) => {
    // Create a journey via chat
    await page.goto('https://oasara.com/start');
    await expect(page.locator('text=What brings you here today')).toBeVisible({ timeout: 10000 });

    const inputField = page.locator('input[placeholder*="Tell me what"]');
    await inputField.fill('I need dental implants, budget $5000-$10000, flexible timeline');

    const sendButton = page.locator('button').filter({ has: page.locator('svg path[d*="12 19l9 2-9-18"]') });
    await sendButton.click();

    // Wait for journey creation
    await expect(page.locator('text=Your journey is ready')).toBeVisible({ timeout: 60000 });
    await page.waitForURL('**/my-journey**', { timeout: 15000 });

    // Now navigate away to homepage
    await page.click('a:has-text("Facilities")');
    await page.waitForURL('https://oasara.com/', { timeout: 10000 });

    // Click "My Journey" in nav
    await page.click('a:has-text("My Journey")');
    await page.waitForURL('**/my-journey', { timeout: 10000 });

    // Should show dashboard, NOT redirect to /start
    const currentUrl = page.url();
    expect(currentUrl).toBe('https://oasara.com/my-journey');

    // Verify journey data is shown
    await expect(page.locator('text=dental implants').first()).toBeVisible({ timeout: 10000 });

    console.log('✅ Clicking My Journey nav shows dashboard correctly');
  });
});
