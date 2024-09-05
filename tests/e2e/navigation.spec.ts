import { test, expect } from "@playwright/test";

test("should navigate correctly", async ({ page }) => {
    // start tests in authenticated state
    await page.goto("http://localhost:3000/dashboard");

    // dashboard buttons should open another page calendar view, list view, etc.
    await page.getByRole("button", { name: "CALENDAR VIEW" }).click();
    await expect(page).toHaveURL("http://localhost:3000/calendar-view");
    await page.goto("http://localhost:3000/dashboard");

    await page.getByRole("button", { name: "LIST VIEW" }).click();
    await expect(page).toHaveURL("http://localhost:3000/list-view");
    await page.goto("http://localhost:3000/dashboard");

    await page.getByRole("button", { name: "KANBAN VIEW" }).click();
    await expect(page).toHaveURL("http://localhost:3000/kanban-view");
    await page.goto("http://localhost:3000/dashboard");

    const appBar = page.locator("nav.appbar");
    await expect(appBar).toBeVisible();

    await page.goto("http://localhost:3000/logout");
    // expect to be able to go to register page
    await page.goto("http://localhost:3000/register");
    await expect(page).toHaveURL("http://localhost:3000/register");

    // expect to be able to go to login page
    await page.goto("http://localhost:3000/login");
    await expect(page).toHaveURL("http://localhost:3000/login");

    // expect to not be able to go to dashboard without logging in
    await page.goto("http://localhost:3000/dashboard");
    await expect(page).not.toHaveURL("http://localhost:3000/dashboard");
});
