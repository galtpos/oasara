import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'https://oasara.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        hasTouch: false,
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 12'],
        hasTouch: true, // Enable touch support for mobile
        // Use Chromium instead of WebKit for mobile testing
        browserName: 'chromium',
      },
    },
  ],
});
