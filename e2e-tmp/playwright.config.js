const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'https://ducheng.nju.top',
    headless: true,
    ignoreHTTPSErrors: true,
    viewport: { width: 375, height: 812 }, // Mobile viewport
    locale: 'zh-CN',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
