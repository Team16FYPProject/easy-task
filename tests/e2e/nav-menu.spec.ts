import { test, expect } from "@playwright/test";

test("nav menu should be accessible throughout the website and be operable", async ({ page }) => {
    // start tests in authenticated state
    await page.goto("/dashboard");

    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Dashboard" }).click();
    await page.waitForURL("/dashboard");
    await expect(page).toHaveURL("/dashboard");

    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Profile" }).click();
    await page.waitForURL("/profile");
    await expect(page).toHaveURL("/profile");

    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Projects" }).click();
    await page.waitForURL("/project");
    await expect(page).toHaveURL("/project");

    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Achievements" }).click();
    await page.waitForURL("/achievement");
    await expect(page).toHaveURL("/achievement");

    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Calendar View" }).click();
    await page.waitForURL("/calendar");
    await expect(page).toHaveURL("/calendar");

    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "List View" }).click();
    await page.waitForURL("/listView");
    await expect(page).toHaveURL("/listView");

    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Kanban View" }).click();
    await page.waitForURL("/kanban");
    await expect(page).toHaveURL("/kanban");
});
