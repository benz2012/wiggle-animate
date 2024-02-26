/* eslint-disable import/no-extraneous-dependencies */
const { defineConfig, devices } = require('@playwright/test')

const isCI = process.env.NODE_ENV !== 'production'

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  reporter: 'html',

  use: { baseURL: 'http://127.0.0.1:3000/_subapps/animate' },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000/_subapps/animate',
  },
})
