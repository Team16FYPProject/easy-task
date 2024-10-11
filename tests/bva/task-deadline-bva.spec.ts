import { test, expect } from "@playwright/test";

test("task_deadline field should only accept future dates", async ({ page }) => {
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

    // No Task Deadline set: Expect an error
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task deadline is a required field")).toBeVisible();

    // Set a date in the past: Expect an error
    await page.getByPlaceholder("MM/DD/YYYY hh:mm aa").click();
    await page.getByPlaceholder("MM/DD/YYYY hh:mm aa").type("11/11/1111 11:11 PM");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Task deadline cannot be in the past")).toBeVisible();

    // Set a date in the future: Expect an error
    await page.getByPlaceholder("MM/DD/YYYY hh:mm aa").click();
    await page.getByPlaceholder("MM/DD/YYYY hh:mm aa").type("11/11/2099 11:11 PM");
    await page.getByRole("button", { name: "Submit" }).click();
    // We have created a task, expect modal to close
    await expect(page.getByText("Create Task")).not.toBeVisible();
});
