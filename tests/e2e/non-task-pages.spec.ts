import { test, expect } from "@playwright/test";

test("should render all non-task pages correctly", async ({ page }) => {
    await page.goto("/project");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    // Should be able to create project via Projects page
    await page.getByRole("button", { name: "CREATE PROJECT" }).click();
    await expect(page.getByRole("heading", { name: "Create Project" })).toBeVisible();
    await expect(page.getByLabel("Project Name *")).toBeVisible();
    await expect(
        page
            .locator("div")
            .filter({ hasText: /^Project Description$/ })
            .locator("#outlined-basic"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Create" }).click();
    // Should show error message when attempting to create invalid team
    await expect(page.getByText("Please enter a team name.")).toBeVisible();

    // Should render achievements page properly
    await page.goto("/achievement");
    await expect(page.getByRole("heading", { name: "Achievements" })).toBeVisible();
    await expect(page.locator("image")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Description" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Progress" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
});
