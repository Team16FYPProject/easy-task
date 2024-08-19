import { test, expect } from "@playwright/test";

test("should navigate correctly", async ({ page }) => {
    // expect to be able to go to register page
    await page.goto("http://localhost:3000/register");
    await expect(page).toHaveURL("http://localhost:3000/register");

    // on the register page, we expect to be able to register for an account and submit form
    // we expect to have 4 textboxes for email, password, first name and last name
    await expect(page.getByRole("textbox")).toHaveCount(4);

    // expect to be able to go to login page
    await page.goto("http://localhost:3000/login");
    await expect(page).toHaveURL("http://localhost:3000/login");
    // expect to have email and password forms
    await expect(page.getByRole("textbox")).toHaveCount(2);

    // expect to not be able to go to dashboard without logging in
    await page.goto("http://localhost:3000/dashboard");
    await expect(page).not.toHaveURL("http://localhost:3000/dashboard");
});
