import { expect, test } from "@playwright/test";

test.describe("reset password page", () => {
  test("should render invalid token state when token is missing", async ({
    page,
  }) => {
    await page.goto("/en/auth/reset-password");

    await expect(
      page.getByText("Invalid or expired link", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText(
        "This recovery link is no longer valid. Request a new link to reset your password.",
        {
          exact: true,
        },
      ),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Request a new link" }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Back to sign in" }),
    ).toBeVisible();
  });

  test("should navigate to forgot password page from invalid token state", async ({
    page,
  }) => {
    await page.goto("/en/auth/reset-password");

    await page.getByRole("button", { name: "Request a new link" }).click();

    await expect(page).toHaveURL(/\/en\/auth\/forgot-password$/);
  });

  test("should navigate back to sign in from invalid token state", async ({
    page,
  }) => {
    await page.goto("/en/auth/reset-password");

    await page.getByRole("button", { name: "Back to sign in" }).click();

    await expect(page).toHaveURL(/\/en\/auth\/signin$/);
  });

  test("should render reset password form with valid token", async ({
    page,
  }) => {
    await page.goto("/en/auth/reset-password?token=test-token");

    await expect(page.locator("form")).toBeVisible();

    await expect(
      page.getByLabel("New password", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByLabel("Confirm new password", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Reset password" }),
    ).toBeVisible();
  });

  test("should show validation error for short password", async ({ page }) => {
    await page.goto("/en/auth/reset-password?token=test-token");

    await page.getByLabel("New password", { exact: true }).fill("123");

    await page.getByLabel("Confirm new password", { exact: true }).fill("123");

    await page.getByRole("button", { name: "Reset password" }).click();

    await expect(page).toHaveURL(
      /\/en\/auth\/reset-password\?token=test-token$/,
    );

    await expect(
      page.getByText("Your password must be at least 8 characters.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("should show validation error when passwords do not match", async ({
    page,
  }) => {
    await page.goto("/en/auth/reset-password?token=test-token");

    await page.getByLabel("New password", { exact: true }).fill("password123");

    await page
      .getByLabel("Confirm new password", { exact: true })
      .fill("different123");

    await page.getByRole("button", { name: "Reset password" }).click();

    await expect(page).toHaveURL(
      /\/en\/auth\/reset-password\?token=test-token$/,
    );

    await expect(
      page.getByText("The passwords do not match.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("should navigate back to sign in page", async ({ page }) => {
    await page.goto("/en/auth/reset-password?token=test-token");

    await page.getByRole("button", { name: "Back to sign in" }).click();

    await expect(page).toHaveURL(/\/en\/auth\/signin$/);
  });
});
