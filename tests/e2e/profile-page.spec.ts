import { test, expect } from "@playwright/test";

test("should be able to change account settings via profile page", async ({ page }) => {
    await page.goto("/profile");

    const FIRST_NAME = "Playwright";
    const LAST_NAME = "Test";
    const EMAIL = "playwright@easy-task.com";
    // Ensure page renders correctly
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expect(page.getByText("PT")).toBeVisible();
    await expect(page.getByRole("heading", { name: `${FIRST_NAME} ${LAST_NAME}` })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();

    // Should be able to change account settings such as bio
    await page.getByRole("link", { name: "EDIT PROFILE" }).click();
    await page.waitForURL("/update-profile");
    // Test the inputs are autofilled correctly
    await expect(page.getByLabel("First Name")).not.toBeEmpty();
    await expect(page.getByLabel("First Name")).toHaveValue(FIRST_NAME);
    await expect(page.getByLabel("Last Name")).toHaveValue(LAST_NAME);
    await expect(page.getByLabel("Email Address *")).toHaveValue(EMAIL);

    const testBio = "Bio " + Date.now();
    await page.getByLabel("Bio").fill(testBio);
    // Save profile
    page.once("dialog", (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept().catch(() => {});
    });
    await page.getByRole("button", { name: "Update" }).click();
    await page.waitForURL("/profile");

    // Test profile updated properly
    await page.getByText(testBio).click();
});
