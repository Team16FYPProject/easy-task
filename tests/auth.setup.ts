import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
    // Perform authentication steps.
    await page.goto("http://localhost:3000/login");
    await page.getByPlaceholder("john@example.com").fill("john@example.com");
    await page.getByPlaceholder("Password").fill("password");
    await page.getByRole("button", { name: "Submit" }).click();
    // Wait until the page receives the cookies.
    //
    await page.waitForURL("http://localhost:3000/dashboard");

    // End of authentication steps.
    await page.context().storageState({ path: authFile });
});
