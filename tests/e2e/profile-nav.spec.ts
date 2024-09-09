import { test, expect } from "@playwright/test";

test("should navigate to profile page", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");
    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Profile" }).click();
    await expect(page.locator("svg").filter({ hasText: "CompletedIn ProgressNot" })).toBeVisible();
    await expect(page.getByRole("img").nth(1)).toBeVisible();
    await expect(page.locator("h3")).toContainText("Profile");
});
