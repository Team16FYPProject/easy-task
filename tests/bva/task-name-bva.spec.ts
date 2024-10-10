import { test, expect } from "@playwright/test";

test("task_name field should only accept characters of length (0,30]", async ({ page }) => {
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

    // Set Name
    // Name of length 0: Expect an error message telling us name can not be empty
    await page.locator("#outlined-basic").first().fill("");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task name is a required field")).toBeVisible();

    // Name of length 1: We have provided a valid task name, expect error for other empty fields
    await page.locator("#outlined-basic").first().fill("a");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task deadline is a required field")).toBeVisible();

    // Name of length 30: We have provided a valid task name, expect error for other empty fields
    await page.locator("#outlined-basic").first().fill("a".repeat(30));
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task deadline is a required field")).toBeVisible();

    // Name of length 31: We have provided an invalid task name, expect error
    await page.locator("#outlined-basic").first().fill("a".repeat(31));
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task name must be under 30 characters")).toBeVisible();

    // Name of length 15: We have provided a valid task name, expect error for other empty fields
    await page.locator("#outlined-basic").first().fill("a".repeat(15));
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task deadline is a required field")).toBeVisible();
});
