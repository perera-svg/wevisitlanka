import { expect, test } from "@playwright/test";

test("page title is non-empty", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/.+/);
});

test("page has visible body", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("body")).toBeVisible();
});
