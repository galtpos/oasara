import { test, expect, devices } from '@playwright/test';

const BASE_URL = 'https://oasara.com';

test.describe('Oasara Smoke Tests - Desktop', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto(BASE_URL);

    // Take screenshot
    await page.screenshot({ path: 'test-results/desktop-homepage.png', fullPage: true });

    // Check title
    await expect(page).toHaveTitle(/Oasara|Medical Tourism|Healthcare/i);

    // Check hero section visible
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();

    console.log('✅ Homepage loaded');
  });

  test('Can search for facilities', async ({ page }) => {
    await page.goto(BASE_URL);

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]').first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('dental');
      await page.screenshot({ path: 'test-results/desktop-search-filled.png' });

      // Try to find and click search button
      const searchButton = page.locator('button:has-text("Search"), button[type="submit"]').first();
      if (await searchButton.count() > 0) {
        await searchButton.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'test-results/desktop-search-results.png', fullPage: true });
        console.log('✅ Search completed');
      } else {
        console.log('⚠️  Search button not found');
      }
    } else {
      console.log('❌ Search input not found on homepage');
      await page.screenshot({ path: 'test-results/desktop-no-search.png', fullPage: true });
    }
  });

  test('Can navigate to facilities page', async ({ page }) => {
    await page.goto(BASE_URL);

    // Look for facilities link
    const facilitiesLink = page.locator('a:has-text("Facilities"), a:has-text("Browse"), a:has-text("Search")').first();

    if (await facilitiesLink.count() > 0) {
      await facilitiesLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/desktop-facilities-page.png', fullPage: true });
      console.log('✅ Navigated to facilities');
    } else {
      console.log('⚠️  Facilities link not found');
    }
  });
});

test.describe('Oasara Smoke Tests - Mobile (iPhone)', () => {
  test('Homepage loads on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 size
    await page.goto(BASE_URL);
    await page.screenshot({ path: 'test-results/mobile-homepage.png', fullPage: true });

    // Check if content is visible
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();

    // Check for horizontal scroll (bad!)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    if (bodyWidth > viewportWidth) {
      console.log(`❌ HORIZONTAL SCROLL DETECTED: Body ${bodyWidth}px > Viewport ${viewportWidth}px`);
    } else {
      console.log('✅ No horizontal scroll');
    }
  });

  test('Mobile navigation works', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 size
    await page.goto(BASE_URL);

    // Dismiss feedback banner if present (it blocks clicks)
    const dismissButton = page.locator('button.banner-dismiss, button:has-text("Got it")');
    if (await dismissButton.count() > 0) {
      await dismissButton.first().click({ force: true });
      await page.waitForTimeout(500); // Wait for banner to disappear
    }

    // Look for hamburger menu
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i], button:has-text("☰")').first();

    if (await menuButton.count() > 0) {
      await menuButton.click();
      await page.screenshot({ path: 'test-results/mobile-menu-open.png' });
      console.log('✅ Mobile menu opened');
    } else {
      console.log('⚠️  Mobile menu button not found');
      await page.screenshot({ path: 'test-results/mobile-no-menu.png' });
    }
  });

  test('Can interact with search on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 size
    await page.goto(BASE_URL);

    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();

    if (await searchInput.count() > 0) {
      // Tap into search
      await searchInput.tap();
      await page.screenshot({ path: 'test-results/mobile-search-focused.png' });

      // Check if keyboard appeared (input should still be visible)
      const inputVisible = await searchInput.isVisible();
      if (!inputVisible) {
        console.log('❌ Search input hidden after focus (keyboard blocking?)');
      } else {
        await searchInput.fill('dental');
        await page.screenshot({ path: 'test-results/mobile-search-filled.png' });
        console.log('✅ Mobile search functional');
      }
    } else {
      console.log('❌ Search not found on mobile');
    }
  });
});
