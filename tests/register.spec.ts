import { expect, test } from "@playwright/test";

test.describe("Register Page", () => {
	test("renders the registration form with all elements", async ({ page }) => {
		await page.goto("/register");

		// Logo
		await expect(page.getByText("Sri Lanka Tourism")).toBeVisible();
		await expect(page.getByText("Business Portal")).toBeVisible();

		// Header
		await expect(
			page.getByRole("heading", { name: "Create your account" }),
		).toBeVisible();
		await expect(
			page.getByText("Register your business to start receiving bookings"),
		).toBeVisible();

		// Form fields
		await expect(page.getByLabel("Full name")).toBeVisible();
		await expect(page.getByLabel("Business email")).toBeVisible();
		await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
		await expect(page.getByLabel("Confirm password")).toBeVisible();

		// Terms checkbox
		await expect(page.getByText("I agree to the")).toBeVisible();

		// Submit button
		await expect(
			page.getByRole("button", { name: "Create Account" }),
		).toBeVisible();

		// Social login buttons
		await expect(
			page.getByRole("button", { name: /Google/ }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /GitHub/ }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /Apple/ }),
		).toBeVisible();

		// Login link
		await expect(page.getByText("Already have an account?")).toBeVisible();
	});

	test("shows password strength bar when typing", async ({ page }) => {
		await page.goto("/register");

		const passwordInput = page.getByLabel("Password", { exact: true });
		await passwordInput.fill("Test1234!");

		// Strength bar should appear with "Strong" label
		await expect(page.getByText("Strong")).toBeVisible();
	});

	test("shows validation error for invalid email on blur", async ({
		page,
	}) => {
		await page.goto("/register");

		const emailInput = page.getByLabel("Business email");
		await emailInput.fill("not-an-email");
		await emailInput.blur();

		// Should show email validation error
		await expect(
			page.getByText("Please enter a valid email address"),
		).toBeVisible();
	});

	test("shows password mismatch error", async ({ page }) => {
		await page.goto("/register");

		const password = page.getByLabel("Password", { exact: true });
		const confirm = page.getByLabel("Confirm password");

		await password.fill("Test1234!");
		await confirm.fill("DifferentPassword!");
		await confirm.blur();

		await expect(page.getByText("Passwords do not match")).toBeVisible();
	});
});
