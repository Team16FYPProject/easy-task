import { test, expect } from "@playwright/test";

test("should be able to create a new team", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");
    await page.getByRole("button", { name: "CREATE TEAM" }).click();
    await page.getByLabel("Team Name").click();
    await page.getByLabel("Team Name").fill("New Team");
    await page.getByRole("button", { name: "Create" }).click();
    await page.goto("http://localhost:3000/dashboard");
    await expect(page.getByRole("button", { name: "Group Icon New Team" }).nth(1)).toBeVisible();
});
