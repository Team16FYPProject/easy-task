import { test, expect } from "@playwright/test";

test("should be able to create and manage a new project", async ({ page }) => {
    // Start at dashboard
    await page.goto("/dashboard");
    // Create project
    const PROJECT_NAME = "Test Project";
    await page.getByRole("button", { name: "CREATE PROJECT" }).click();
    await page.getByLabel("Project Name *").fill(PROJECT_NAME);
    await page
        .locator("div")
        .filter({ hasText: /^Project Description$/ })
        .locator("#outlined-basic")
        .fill("Test Description");
    await page.getByRole("button", { name: "Create" }).click();

    // Should be on project management page
    await expect(page.getByRole("button", { name: "LEAVE PROJECT" })).toBeVisible({
        timeout: 60000,
    });
    await expect(page).not.toHaveURL("/dashboard");

    // Name should be correct
    await expect(
        page.getByRole("heading", { name: `Project ${PROJECT_NAME} Members` }),
    ).toBeVisible();

    // The member should have been added
    await expect(page.getByRole("cell", { name: "Playwright Test" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "playwright@easy-task.com" })).toBeVisible();

    // Test inviting members
    await page.getByRole("button", { name: "INVITE MEMBER" }).click();
    await page.getByLabel("Email").fill("oagu0001@student.monash.edu");
    await page.getByRole("button", { name: "INVITE" }).click();

    // User should have been added
    await expect(page.getByRole("cell", { name: "Elijah A" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "oagu0001@student.monash.edu" })).toBeVisible();
    page.once("dialog", (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept().catch(() => {});
    });

    // Test removing member
    await page.getByRole("row", { name: "Elijah A oagu0001@student." }).getByRole("button").click();
    page.once("dialog", (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept().catch(() => {});
    });
    await expect(page.getByRole("cell", { name: "Elijah A" })).not.toBeVisible();
    await expect(page.getByRole("cell", { name: "oagu0001@student.monash.edu" })).not.toBeVisible();

    // Test deleting the project
    await page.getByRole("button", { name: "LEAVE PROJECT" }).click();
    await page.waitForURL("/dashboard");
    await expect(page).toHaveURL("/dashboard");
});
