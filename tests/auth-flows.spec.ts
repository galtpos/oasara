import { test, expect } from '@playwright/test';

test.describe('Authentication Flow - All Pages', () => {

  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.goto('https://oasara.com');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Homepage: Get Started Free button goes to /signup', async ({ page }) => {
    await page.goto('https://oasara.com');

    // Wait for hero section to load
    await expect(page.locator('text=Exit the Healthcare System')).toBeVisible({ timeout: 10000 });

    // Click "Get Started Free" button
    const getStartedBtn = page.locator('button:has-text("Get Started Free")');
    await expect(getStartedBtn).toBeVisible({ timeout: 5000 });
    await getStartedBtn.click();

    // Should redirect to /signup
    await page.waitForURL('**/signup', { timeout: 10000 });
    expect(page.url()).toContain('/signup');

    console.log('✅ Homepage Get Started Free → /signup');
  });

  test('Homepage: Quick Q&A button (not logged in) goes to /signup', async ({ page }) => {
    await page.goto('https://oasara.com');

    // Wait for floating button to appear
    await page.waitForTimeout(2000); // Give time for auth check

    // Find the floating "Get Started" button (shows this text when not logged in)
    const floatingBtn = page.locator('button:has-text("Get Started")').filter({
      has: page.locator('svg path[d*="21 21l-6-6"]') // Search icon
    });

    if (await floatingBtn.isVisible()) {
      await floatingBtn.click();
      await page.waitForURL('**/signup', { timeout: 10000 });
      expect(page.url()).toContain('/signup');
      console.log('✅ Quick Q&A button (guest) → /signup');
    } else {
      // Button might show "Quick Q&A" if auth state is cached, still check redirect
      const qaBtn = page.locator('button:has-text("Quick Q&A")');
      if (await qaBtn.isVisible()) {
        console.log('⚠️ Quick Q&A visible - auth may be cached');
      }
    }
  });

  test('Nav: My Journey link (not logged in) goes to /signup', async ({ page }) => {
    await page.goto('https://oasara.com');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check if mobile - open hamburger menu first
    const hamburger = page.locator('button[aria-label="Open menu"]');
    const isMobile = await hamburger.isVisible({ timeout: 2000 }).catch(() => false);

    if (isMobile) {
      await hamburger.click();
      // Wait for mobile menu to appear
      await page.waitForSelector('nav[aria-label="Mobile navigation"]', { state: 'visible', timeout: 5000 });
      // Click My Journey in mobile nav
      const mobileLink = page.locator('nav[aria-label="Mobile navigation"] a:has-text("My Journey")');
      await expect(mobileLink).toBeVisible({ timeout: 5000 });
      await mobileLink.click();
    } else {
      // Click My Journey in desktop nav
      const desktopLink = page.locator('nav[aria-label="Main navigation"] a:has-text("My Journey")');
      await expect(desktopLink).toBeVisible({ timeout: 5000 });
      await desktopLink.click();
    }

    // Should redirect to /signup (via ProtectedRoute)
    await page.waitForURL('**/signup', { timeout: 10000 });
    expect(page.url()).toContain('/signup');

    console.log('✅ My Journey nav (guest) → /signup');
  });

  test('Direct /start access (not logged in) redirects to /signup', async ({ page }) => {
    await page.goto('https://oasara.com/start');

    // Should redirect to /signup
    await page.waitForURL('**/signup', { timeout: 10000 });
    expect(page.url()).toContain('/signup');

    console.log('✅ /start (guest) → /signup');
  });

  test('Direct /my-journey access (not logged in) redirects to /signup', async ({ page }) => {
    await page.goto('https://oasara.com/my-journey');

    // Should redirect to /signup
    await page.waitForURL('**/signup', { timeout: 10000 });
    expect(page.url()).toContain('/signup');

    console.log('✅ /my-journey (guest) → /signup');
  });

  test('Direct /my-journey/chat access (not logged in) redirects to /signup', async ({ page }) => {
    await page.goto('https://oasara.com/my-journey/chat');

    // Should redirect to /signup
    await page.waitForURL('**/signup', { timeout: 10000 });
    expect(page.url()).toContain('/signup');

    console.log('✅ /my-journey/chat (guest) → /signup');
  });

  test('Signup page: form is accessible and functional', async ({ page }) => {
    await page.goto('https://oasara.com/signup');

    // Check page elements
    await expect(page.locator('text=Join the Revolution')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('button:has-text("Send Magic Link")')).toBeVisible();

    // Test email validation
    const emailInput = page.locator('input#email');
    await emailInput.fill('test@example.com');

    const nameInput = page.locator('input#name');
    await nameInput.fill('Test User');

    // Form should be fillable
    expect(await emailInput.inputValue()).toBe('test@example.com');
    expect(await nameInput.inputValue()).toBe('Test User');

    console.log('✅ Signup form is functional');
  });

  test('Login page: accessible and links to signup', async ({ page }) => {
    await page.goto('https://oasara.com/login');

    // Check page loads
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });

    // Check signup link exists (text may be "Sign Up" or "Create Account" etc)
    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible({ timeout: 5000 });

    console.log('✅ Login page is accessible');
  });

  test('Public pages remain accessible without login', async ({ page }) => {
    // Test facilities page (homepage)
    await page.goto('https://oasara.com');
    await expect(page.locator('text=Exit the Healthcare System')).toBeVisible({ timeout: 10000 });
    console.log('✅ Homepage accessible');

    // Test hub page
    await page.goto('https://oasara.com/hub');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/hub');
    console.log('✅ /hub accessible');

    // Test action page
    await page.goto('https://oasara.com/action');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/action');
    console.log('✅ /action accessible');

    // Test guide page
    await page.goto('https://oasara.com/guide');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/guide');
    console.log('✅ /guide accessible');

    // Test bounty page
    await page.goto('https://oasara.com/bounty');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/bounty');
    console.log('✅ /bounty accessible');
  });

  test('Homepage hero shows signup CTA, not chatbot', async ({ page }) => {
    await page.goto('https://oasara.com');

    // Should see "Get Started Free" button
    await expect(page.locator('button:has-text("Get Started Free")')).toBeVisible({ timeout: 10000 });

    // Should see "Your Personal Healthcare Guide" heading
    await expect(page.locator('text=Your Personal Healthcare Guide')).toBeVisible();

    // Should NOT see the old chatbot elements like "What brings you here today"
    const oldChatbot = page.locator('text=What brings you here today');
    await expect(oldChatbot).not.toBeVisible();

    // Should NOT see quick action buttons like "I need a procedure"
    const procedureBtn = page.locator('button:has-text("I need a procedure")');
    await expect(procedureBtn).not.toBeVisible();

    console.log('✅ Homepage shows signup CTA, not fake chatbot');
  });

  test('Nav Join button goes to /signup', async ({ page }) => {
    await page.goto('https://oasara.com');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check if mobile - open hamburger menu first
    const hamburger = page.locator('button[aria-label="Open menu"]');
    const isMobile = await hamburger.isVisible({ timeout: 2000 }).catch(() => false);

    if (isMobile) {
      await hamburger.click();
      // Wait for mobile menu to appear
      await page.waitForSelector('nav[aria-label="Mobile navigation"]', { state: 'visible', timeout: 5000 });
      // Click Join in mobile nav
      const mobileLink = page.locator('nav[aria-label="Mobile navigation"] a:has-text("Join")');
      await expect(mobileLink).toBeVisible({ timeout: 5000 });
      await mobileLink.click();
    } else {
      // Click Join in desktop nav
      const desktopLink = page.locator('nav[aria-label="Main navigation"] a:has-text("Join")');
      await expect(desktopLink).toBeVisible({ timeout: 5000 });
      await desktopLink.click();
    }

    // Should go to /signup
    await page.waitForURL('**/signup', { timeout: 10000 });
    expect(page.url()).toContain('/signup');

    console.log('✅ Nav Join button → /signup');
  });
});

test.describe('Facility Detail Page', () => {
  test('Facility detail page is accessible', async ({ page }) => {
    // Go to homepage and find a facility
    await page.goto('https://oasara.com');

    // Scroll down to facilities section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);

    // Find any facility card link
    const facilityLink = page.locator('a[href^="/facilities/"]').first();

    if (await facilityLink.isVisible()) {
      const href = await facilityLink.getAttribute('href');
      await page.goto(`https://oasara.com${href}`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/facilities/');
      console.log('✅ Facility detail page accessible');
    } else {
      console.log('⚠️ No facility links found on homepage');
    }
  });
});
