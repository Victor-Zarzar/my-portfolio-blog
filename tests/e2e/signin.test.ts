import { expect, test } from "@playwright/test";

test.describe("sign in page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/auth/signin");
  });

  test("should render sign in form fields", async ({ page }) => {
    await expect(page.locator("form")).toBeVisible();

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  test("should render forgot password button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Forgot your password?" }),
    ).toBeVisible();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.getByRole("button", { name: "Forgot your password?" }).click();

    await expect(page).toHaveURL(/\/en\/auth\/forgot-password$/);
  });

  test("should render sign up button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
  });

  test("should navigate to sign up page", async ({ page }) => {
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page).toHaveURL(/\/en\/auth\/signup$/);
  });

  test("should show validation errors for invalid credentials", async ({
    page,
  }) => {
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Password").fill("123");

    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/en\/auth\/signin$/);

    await expect(
      page.getByText("Invalid email", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText("Password must be at least 6 characters", {
        exact: true,
      }),
    ).toBeVisible();
  });
});
