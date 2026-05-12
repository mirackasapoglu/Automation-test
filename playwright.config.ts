import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['html', { open: 'never' }]],
  workers: 1,

  globalSetup: require.resolve('./global-setup'),

  use: {
    baseURL: 'https://www.nadirgold.work',
    storageState: 'playwright/.auth/user.json',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});