import { test, expect } from "@playwright/test";

test("should navigate to the achievements page", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");
    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Achievements" }).click();
    await expect(page.locator("h3")).toContainText("Achievements");
    await expect(page.locator("svg").filter({ hasText: "CompletedIn ProgressNot" })).toBeVisible();
    await expect(page.locator("img")).toBeVisible();
    await expect(page.locator("div").filter({ hasText: "NameSakuraStatus" }).nth(3)).toBeVisible();
});
