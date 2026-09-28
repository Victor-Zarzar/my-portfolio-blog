import { expect, test } from "@playwright/test";

test.describe("sign up page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/auth/signup");
  });

  test("should render sign up form fields", async ({ page }) => {
    await expect(page.locator("form")).toBeVisible();

    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Create account" }),
    ).toBeVisible();
  });

  test("should render sign in link", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("should navigate to sign in page", async ({ page }) => {
    await page.getByRole("link", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/en\/auth\/signin$/);
  });

  test("should show validation errors for invalid fields", async ({ page }) => {
    await page.getByLabel("Name").fill("A");
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Password", { exact: true }).fill("123");
    await page.getByLabel("Confirm password").fill("123");

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(
      page.getByText("Name must contain at least 2 characters.", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Enter a valid email address.", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Password must contain at least 6 characters.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("should show error when passwords do not match", async ({ page }) => {
    await page.getByLabel("Name").fill("Victor");
    await page.getByLabel("Email").fill("victor@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("different123");

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(
      page.getByText("Passwords do not match.", {
        exact: true,
      }),
    ).toBeVisible();
  });
});
