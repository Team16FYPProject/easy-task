import { test, expect } from "@playwright/test";

test("task_description field should only accept characters of length [0,50]", async ({ page }) => {
    // Start at dashboard
    await page.goto("/dashboard");
    const PROJECT_NAME = "Test " + Date.now().toString();

    // Create Project for tasks.
    await page.getByRole("button", { name: "CREATE PROJECT" }).click();
    await page.getByLabel("Project Name *").fill(PROJECT_NAME);
    await page
        .locator("div")
        .filter({ hasText: /^Project Description$/ })
        .locator("#outlined-basic")
        .fill("Test project for testing tasks");
    await page.getByRole("button", { name: "Create" }).click();

    // Navigate to Kanban page
    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Kanban View" }).click();

    // Select the project we just created
    await page.getByLabel("Project").click();
    await page.getByRole("option", { name: PROJECT_NAME }).click();

    // Create the Task
    await page.getByRole("button", { name: "CREATE TASK" }).click();

    // Set Task Name
    await page.locator("#outlined-basic").first().fill("a");

    // Set Description
    // Description of length 0: We have provided a valid task description, expect error for other empty fields
    await page.locator("#outlined-basic").nth(1).fill("");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task deadline is a required field")).toBeVisible();

    // Description of length 25: We have provided a valid task description, expect error for other empty fields
    await page.locator("#outlined-basic").nth(1).fill("a".repeat(25));
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task deadline is a required field")).toBeVisible();

    // Description of length 50: We have provided a valid task description, expect error for other empty fields
    await page.locator("#outlined-basic").nth(1).fill("a".repeat(50));
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task deadline is a required field")).toBeVisible();

    // Description of length 51: We have provided a invalid task description, expect error
    await page.locator("#outlined-basic").nth(1).fill("a".repeat(51));
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task description must be under 50 characters")).toBeVisible();
});
