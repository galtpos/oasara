const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = '/Users/aaronday/Documents/medicaltourism/oasara-marketplace/public/tutorials/05_create_wallet/screenshots';

async function captureCreateWalletSection() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const browserPage = await context.newPage();

  try {
    console.log('Navigating to GUI wallet page...');
    await browserPage.goto('https://docs.zano.org/docs/use/wallets/gui-wallet', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for content to load
    await browserPage.waitForTimeout(3000);

    // Find and scroll to "Create a new wallet" section
    const createWalletHeading = await browserPage.locator('h2:has-text("Create a new wallet")').first();
    if (await createWalletHeading.count() > 0) {
      await createWalletHeading.scrollIntoViewIfNeeded();
      await browserPage.waitForTimeout(1000);

      // Take a screenshot of the viewport showing the create wallet section
      const screenshotPath = path.join(SCREENSHOT_DIR, '03_create_wallet.png');
      await browserPage.screenshot({
        path: screenshotPath,
        fullPage: false  // Just the viewport
      });
      console.log(`Saved: ${screenshotPath}`);
    } else {
      console.log('Could not find "Create a new wallet" heading, taking full page screenshot');
      const screenshotPath = path.join(SCREENSHOT_DIR, '03_create_wallet.png');
      await browserPage.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      console.log(`Saved: ${screenshotPath}`);
    }

  } catch (error) {
    console.error(`Error:`, error.message);
  }

  await browserPage.close();
  await browser.close();
  console.log('Done!');
}

captureCreateWalletSection().catch(console.error);
