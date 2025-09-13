import { defineConfig, devices, ReporterDescription } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */

// Build a typed reporters array to avoid TypeScript tuple/union inference issues
const reporters: ReporterDescription[] = [
  ["list", { printSteps: true }],
  [
    "html",
    {
      outputFolder: "playwright-report",
      open: "never",
    },
  ],
  ["json", { outputFile: "playwright-report/results.json" }],
  ["junit", { outputFile: "playwright-report/results.xml" }],
];

// Conditionally add CI-specific reporters in a type-safe way
if (process.env.CI) {
  reporters.push(["github", {}], ["blob", {}]);
}

export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry failed tests to handle flaky tests */
  retries: process.env.CI ? 3 : 1,
  /* Optimal worker configuration for performance */
  workers: process.env.CI ? 4 : "50%", // Optimized for better parallel execution
  /* Maximum failures before stopping the test run */
  maxFailures: process.env.CI ? 10 : 5,
  /* Global test timeout */
  timeout: 60000, // 60 seconds per test
  /* Global setup timeout */
  globalTimeout: 600000, // 10 minutes for entire test run
  /* Expect timeout for assertions */
  expect: {
    timeout: 10000, // 10 seconds for expect assertions
    /* Capture screenshots on assertion failures */
    toHaveScreenshot: { threshold: 0.3 },
    toMatchSnapshot: { threshold: 0.3 },
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: reporters,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL:
      process.env.PLAYWRIGHT_TEST_BASE_URL ||
      "https://hudsondigitalsolutions.com",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? "retain-on-failure" : "on-first-retry",
    /* Take screenshot on failure */
    screenshot: {
      mode: "only-on-failure",
      fullPage: true,
    },
    /* Video recording settings */
    video: {
      mode: process.env.CI ? "retain-on-failure" : "off",
      size: { width: 1280, height: 720 },
    },
    /* Action timeout */
    actionTimeout: 15000, // 15 seconds for individual actions
    /* Navigation timeout */
    navigationTimeout: 30000, // 30 seconds for page navigation
    /* Ignore HTTPS errors in development */
    ignoreHTTPSErrors: !process.env.CI,
    /* Viewport size */
    viewport: { width: 1280, height: 720 },
    /* User agent */
    userAgent:
      "Mozilla/5.0 (compatible; PlaywrightBot/1.0; +https://playwright.dev)",
    /* Locale and timezone */
    locale: "en-US",
    timezoneId: "America/New_York",
    /* Color scheme preference */
    colorScheme: "light",
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "cleanup",
      testMatch: /.*\.teardown\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        /* Enable Chrome DevTools Protocol for performance monitoring */
        launchOptions: {
          args: [
            "--enable-web-bluetooth",
            "--disable-web-security",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
          ],
        },
      },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      dependencies: ["setup"],
    },
    /* Mobile testing projects */
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        isMobile: true,
        hasTouch: true,
      },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
        isMobile: true,
        hasTouch: true,
      },
      dependencies: ["setup"],
    },
    /* Animation Performance Testing */
    {
      name: "animations",
      testMatch: /animations.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        /* Animation-specific settings moved into contextOptions to match BrowserContext options */
        contextOptions: {
          reducedMotion: "no-preference", // Test with animations enabled
        },
        launchOptions: {
          args: [
            "--enable-gpu-rasterization",
            "--enable-accelerated-2d-canvas",
            "--force-device-scale-factor=1",
            "--disable-background-timer-throttling",
          ],
        },
      },
      timeout: 30000, // Shorter timeout for quick tests
    },
    /* High-DPI testing */
    {
      name: "chromium-high-dpi",
      use: {
        ...devices["Desktop Chrome"],
        deviceScaleFactor: 2,
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ["setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 180000, // 3 minutes for server startup
    env: {
      NODE_ENV: "test",
      PORT: "3000",
      /* Disable analytics in test environment */
      NEXT_PUBLIC_POSTHOG_KEY: "",
      DISABLE_ANALYTICS_IN_TESTS: "true",
    },
  },

  /* Global setup and teardown */
  // globalSetup: require.resolve('./e2e/helpers/global-setup.ts'),
  // globalTeardown: require.resolve('./e2e/helpers/global-teardown.ts'),
});
