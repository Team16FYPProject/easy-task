import { test, expect } from "@playwright/test";

test("should properly render the various task view pages", async ({ page }) => {
    // ------ Calendar View ------
    await page.goto("/calendar");
    await expect(page.getByRole("heading", { name: "Calendar View" })).toBeVisible();
    // Expect the navigation buttons to be properly rendered in
    await expect(page.getByRole("button", { name: "Today" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Month" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Week" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Day", exact: true })).toBeVisible();

    // Expect the calendar headers to be properly rendered in
    await page.getByRole("button", { name: "Month" }).click();
    await page.getByRole("heading", { name: "Sun" }).click();
    await page.getByRole("heading", { name: "Mon" }).click();
    await page.getByRole("heading", { name: "Tue" }).click();
    await page.getByRole("heading", { name: "Wed" }).click();
    await page.getByRole("heading", { name: "Thu" }).click();
    await page.getByRole("heading", { name: "Fri" }).click();
    await page.getByRole("heading", { name: "Sat" }).click();

    // ------ List View ------
    await page.goto("/listView");
    await expect(page.getByRole("heading", { name: "List View" })).toBeVisible();
    // The Completed Chart
    await expect(page.getByText("Completed")).toBeVisible();
    await expect(page.getByText("In Progress")).toBeVisible();
    await expect(page.getByText("Not Started")).toBeVisible();
    // The Assigned chart
    await expect(page.getByText("Assigned", { exact: true })).toBeVisible();
    await expect(page.locator("tspan").filter({ hasText: "Not Assigned" })).toBeVisible();
    // The table should be visible
    await expect(page.locator("div").filter({ hasText: "Due DateProject/" }).nth(3)).toBeVisible();
    // Should be able to open Create Task modal
    await page.getByRole("button", { name: "CREATE TASK" }).click();
    await expect(page.locator("form")).toBeVisible();

    // ------ Kanban View ------
    await page.goto("/kanban");
    await expect(page.getByRole("heading", { name: "Kanban View" })).toBeVisible();
    await expect(page.getByLabel("Project")).toBeVisible();
    // The columns should be visible
    await expect(page.getByRole("heading", { name: "TO DO" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "IN PROGRESS" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "COMPLETE" })).toBeVisible();
    // Should be able to open Create Task modal
    await page.getByRole("button", { name: "CREATE TASK" }).click();
    await expect(page.locator("form")).toBeVisible();
});
