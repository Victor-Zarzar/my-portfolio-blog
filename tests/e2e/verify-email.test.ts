import { expect, test } from "@playwright/test";

test.describe("verify email page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/auth/verify-email?email=test@example.com");
  });

  test("should render verify email content", async ({ page }) => {
    await expect(
      page.getByText("Email verification", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("We sent a verification link to:", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("test@example.com", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Can't find the email? Check your spam folder as well.", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("should render resend email button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Resend email" }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Resend email" }),
    ).toBeEnabled();
  });

  test("should render back to sign in button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Back to sign in" }),
    ).toBeVisible();
  });

  test("should navigate back to sign in page", async ({ page }) => {
    await page.getByRole("button", { name: "Back to sign in" }).click();

    await expect(page).toHaveURL(/\/en\/auth\/signin$/);
  });

  test("should disable resend button when email is missing", async ({
    page,
  }) => {
    await page.goto("/en/auth/verify-email");

    await expect(
      page.getByRole("button", { name: "Resend email" }),
    ).toBeDisabled();
  });
});
