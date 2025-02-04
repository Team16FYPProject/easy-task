import { defineConfig, devices } from "@playwright/test";

export const baseURL: string = "http://localhost:3000";
export const authFile: string = "playwright/.auth/user.json";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: "./tests",
    /* Run tests in files in parallel */
    fullyParallel: false,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : 1,
    //  Increase timeout
    timeout: 120000,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: "html",
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: baseURL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "retain-on-first-failure",
    },

    /* Configure projects for major browsers */
    projects: [
        // Setup project
        { name: "setup", testMatch: /.*\.setup\.ts/ },
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"], storageState: authFile },
            testMatch: /.*\.spec\.ts/,
            dependencies: ["setup"],
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: "npm run start",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
    },
});
