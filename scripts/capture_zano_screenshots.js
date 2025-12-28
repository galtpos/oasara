const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = '/Users/aaronday/Documents/medicaltourism/oasara-marketplace/public/tutorials/05_create_wallet/screenshots';

const pages = [
  {
    url: 'https://docs.zano.org/docs/use/wallets/overview',
    filename: '01_docs_overview.png'
  },
  {
    url: 'https://docs.zano.org/docs/use/wallets/gui-wallet',
    filename: '02_wallet_overview.png'
  },
  {
    url: 'https://docs.zano.org/docs/use/seed-phrase',
    filename: '03_seed_phrase.png'
  },
  {
    url: 'https://new.zano.org/downloads',
    filename: '04_downloads.png'
  }
];

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  for (const page of pages) {
    console.log(`Capturing: ${page.url}`);
    const browserPage = await context.newPage();

    try {
      await browserPage.goto(page.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for content to load
      await browserPage.waitForTimeout(2000);

      // Scroll to load lazy images
      await browserPage.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 500;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              resolve();
            }
          }, 100);
        });
      });

      // Wait after scrolling
      await browserPage.waitForTimeout(1000);

      const screenshotPath = path.join(SCREENSHOT_DIR, page.filename);
      await browserPage.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`Saved: ${screenshotPath}`);
    } catch (error) {
      console.error(`Error capturing ${page.url}:`, error.message);
    }

    await browserPage.close();
  }

  await browser.close();
  console.log('Done!');
}

captureScreenshots().catch(console.error);
