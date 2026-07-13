// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:8090',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  workers: 1,
  webServer: [
    {
      command: 'cd backend && docker compose up -d --wait && JWT_SECRET=test-jwt-secret-for-e2e BETA_REDEEM_CODE=grace-beta npm run dev',
      url: 'http://127.0.0.1:3000/health',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: 'CI=1 npx expo start --web --port 8090',
      url: 'http://127.0.0.1:8090',
      reuseExistingServer: true,
      timeout: 180_000,
      env: {
        EXPO_PUBLIC_API_BASE: 'http://localhost:3000',
        EXPO_PUBLIC_BETA_REDEEM_CODE: 'grace-beta',
      },
    },
  ],
});
