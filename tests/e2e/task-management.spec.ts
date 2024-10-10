import { test, expect } from "@playwright/test";

test("should be able to create and manage a task", async ({ page }) => {
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

    // Wait for project to create. Should be on project management page
    await expect(page.getByRole("button", { name: "LEAVE PROJECT" })).toBeVisible();
    await expect(page).not.toHaveURL("/dashboard");

    // Navigate to Kanban page
    await page.getByLabel("menu").click();
    await page.getByRole("button", { name: "Kanban View" }).click();

    // Select the project we just created
    await page.getByLabel("Project").click();
    await page.getByRole("option", { name: PROJECT_NAME }).click();

    // Create the Task
    await page.getByRole("button", { name: "CREATE TASK" }).click();
    // Set Name & Description
    await page.locator("#outlined-basic").first().fill("Task 1");
    await page.locator("#outlined-basic").nth(1).fill("Test Task");
    // Set Date
    await page.getByLabel("Choose date").click();
    await page.getByRole("gridcell", { name: "9", exact: true }).click();
    await page.getByRole("button", { name: "OK" }).click();
    await page.getByText("Task Name *Task").click();
    // Set status
    await page
        .locator(
            "div:nth-child(6) > div > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select",
        )
        .first()
        .click();
    await page.getByRole("option", { name: "TODO" }).click();
    // Set priority
    await page
        .locator(
            "div:nth-child(6) > div:nth-child(2) > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-select",
        )
        .click();
    await page.getByRole("option", { name: "MEDIUM" }).click();
    // Set assignee
    await page.locator("div:nth-child(9) > .MuiInputBase-root > .MuiSelect-select").click();
    await page.getByRole("option", { name: "Playwright Test" }).click();
    await page.locator("#menu- div").first().click();
    // Create
    await page.getByRole("button", { name: "Submit" }).click();

    // Task should be created
    await expect(
        page
            .locator("div")
            .filter({ hasText: /^Task 1 09\/10\/2024, 12:00 amMEDIUM$/ })
            .nth(1),
    ).toBeVisible();

    // Open edit task modal
    await page
        .locator("div")
        .filter({ hasText: /^Task 1 09\/10\/2024, 12:00 amMEDIUM$/ })
        .nth(1)
        .click();
    // Check the task was created with the expected values
    await expect(page.getByRole("heading", { name: "Task" })).toBeVisible();
    await expect(page.getByText("Parent Task: No parent task")).toBeVisible();
    await expect(page.getByText("Test Task", { exact: true })).toBeVisible();
    await expect(page.getByText("Status: TODO")).toBeVisible();
    await expect(page.getByText("Priority: MEDIUM")).toBeVisible();
    await expect(page.getByText("Deadline: 10/09/2024, 12:00 AM")).toBeVisible();
    await expect(page.getByText("Name: Playwright Test | Email")).toBeVisible();

    // Edit the task - Task Priority
    await page.getByRole("button", { name: "EDIT TASK" }).click();
    await page.getByLabel("MEDIUM").click();
    await page.getByRole("option", { name: "HIGH" }).click();
    await page.getByRole("button", { name: "SAVE CHANGES" }).click();
    // Check it was successfully changed
    await expect(page.getByText("Priority: HIGH")).toBeVisible();
    await page.getByRole("button", { name: "LOG HOURS" }).click();
    await expect(page.getByText("Hours Logged:")).toBeVisible();
    await page.getByRole("button", { name: "EDIT TASK" }).click();
    // Edit the task - Task Status
    await page.getByLabel("Task Status").click();
    await page.getByRole("option", { name: "DONE" }).click();
    await page.getByRole("button", { name: "SAVE CHANGES" }).click();

    // Check that the task moved to the right column
    await page.getByText("COMPLETETask 1 09/10/2024, 12").click();

    // Clean up test by deleting project.
    await page.goto("/project");
    await page.getByRole("button", { name: `Group Icon ${PROJECT_NAME}` }).click();
    page.once("dialog", (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept().catch(() => {});
    });
    await page.getByRole("button", { name: "LEAVE PROJECT" }).click();
    await page.waitForURL("/dashboard");
    await expect(page).toHaveURL("/dashboard");
});
