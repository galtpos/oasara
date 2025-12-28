const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TUTORIAL_DIR = path.join(__dirname, '../public/tutorials');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // 01_why_patient - Problem/solution visual
  console.log('Capturing 01_why_patient screenshots...');
  await page.goto('https://oasara.com/why-zano');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: path.join(TUTORIAL_DIR, '01_why_patient/screenshots/01_problem.png'),
    fullPage: false 
  });

  // 02_why_provider - Provider benefits
  console.log('Capturing 02_why_provider screenshots...');
  await page.screenshot({ 
    path: path.join(TUTORIAL_DIR, '02_why_provider/screenshots/01_benefits.png'),
    fullPage: false 
  });

  // 03_download - Zano download page
  console.log('Capturing 03_download screenshots...');
  await page.goto('https://zano.org/downloads');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: path.join(TUTORIAL_DIR, '03_download/screenshots/01_download_page.png'),
    fullPage: false 
  });

  // 04_watch_me - Wallet interface
  console.log('Capturing 04_watch_me screenshots...');
  await page.goto('https://zano.org');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: path.join(TUTORIAL_DIR, '04_watch_me/screenshots/01_zano_home.png'),
    fullPage: false 
  });

  // 05_create_wallet - Setup screen mockup
  console.log('Capturing 05_create_wallet screenshots...');
  await page.goto('https://docs.zano.org/docs/use/gui-wallet');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: path.join(TUTORIAL_DIR, '05_create_wallet/screenshots/01_wallet_guide.png'),
    fullPage: false 
  });

  // 06_get_send - Transaction guide
  console.log('Capturing 06_get_send screenshots...');
  await page.goto('https://docs.zano.org/docs/use/getting-started');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: path.join(TUTORIAL_DIR, '06_get_send/screenshots/01_getting_started.png'),
    fullPage: false 
  });

  // 07_accept_payments - Provider guide
  console.log('Capturing 07_accept_payments screenshots...');
  await page.goto('https://zano.org/features');
  await page.waitForTimeout(2000);
  await page.screenshot({ 
    path: path.join(TUTORIAL_DIR, '07_accept_payments/screenshots/01_features.png'),
    fullPage: false 
  });

  await browser.close();
  console.log('All screenshots captured!');
}

// Create screenshot directories
const tutorials = ['01_why_patient', '02_why_provider', '03_download', '04_watch_me', '05_create_wallet', '06_get_send', '07_accept_payments'];
tutorials.forEach(t => {
  const dir = path.join(TUTORIAL_DIR, t, 'screenshots');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

captureScreenshots().catch(console.error);
