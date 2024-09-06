import { test, expect } from "@playwright/test";

test("should navigate correctly", async ({ page }) => {
    // start tests in authenticated state
    await page.goto("http://localhost:3000/dashboard");

    // expect to be able to go to profile page
    await page.goto("http://localhost:3000/profile");
    await expect(page).toHaveURL("http://localhost:3000/profile");

    // expect to be able to go to achievements page
    await page.goto("http://localhost:3000/achievement");
    await expect(page).toHaveURL("http://localhost:3000/achievement");
});
