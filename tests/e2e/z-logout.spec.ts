import { test, expect } from "@playwright/test";

test("should be able to logout", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Logout" }).click();
    await page.waitForURL("/login");
    await expect(page).toHaveURL("/login");

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
