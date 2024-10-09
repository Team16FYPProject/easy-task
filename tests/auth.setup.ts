import { test as setup, expect } from "@playwright/test";

import { baseURL, authFile } from "../playwright.config";

setup("authenticate", async ({ page }) => {
    // Perform authentication steps.
    await page.goto(`${baseURL}/login`);
    await page.getByLabel("Email Address *").fill("playwright@easy-task.com");
    await page.getByLabel("Password *").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard");
    // Wait for page to load in
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    // Save storage state.
    await page.context().storageState({ path: authFile });
});
