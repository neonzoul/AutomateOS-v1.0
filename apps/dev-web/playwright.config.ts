import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure for debugging */
    screenshot: 'only-on-failure',

    /* Video recording for failed tests */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    // Live environment tests (default for local development)
    {
      name: 'chromium-live',
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined, // Fresh state for each test
      },
      testMatch: /.*\.spec\.ts/,
      testIgnore: process.env.CI ? /smoke-happy-path\.spec\.ts/ : undefined,
    },

    {
      name: 'firefox-live',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: process.env.CI ? /smoke-happy-path\.spec\.ts/ : undefined,
    },

    // CI-safe tests with mocked backend
    {
      name: 'chromium-mock',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: {
          'X-Test-Mode': 'mock',
        },
      },
      testMatch: /(smoke-happy-path|slack-notion-smoke)\.spec\.ts/,
      testIgnore: process.env.CI ? undefined : undefined, // Allow running locally when USE_MOCK_GATEWAY is set
    },

    // Mobile testing for smoke tests
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /smoke-happy-path\.spec\.ts/,
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /smoke-happy-path\.spec\.ts/,
    },

    // Webkit for comprehensive browser coverage (local only)
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*\.spec\.ts/,
      testIgnore: process.env.CI ? /.*/ : undefined, // Skip webkit in CI
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev:with-mock',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
