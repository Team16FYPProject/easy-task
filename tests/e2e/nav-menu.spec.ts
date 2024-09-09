import { test, expect } from "@playwright/test";

test("nav menu should be accessible throughout the website and be operable", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");
    await expect(page.getByLabel("menu")).toBeVisible();
    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Profile" }).click();
    await expect(page).toHaveURL("http://localhost:3000/profile");
    await expect(page.getByLabel("menu")).toBeVisible();
    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Achievements" }).click();
    await expect(page).toHaveURL("http://localhost:3000/achievement");
    await expect(page.getByLabel("menu")).toBeVisible();
});
