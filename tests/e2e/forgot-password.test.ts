import { expect, test } from "@playwright/test";

test.describe("forgot password page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/auth/forgot-password");
  });

  test("should render forgot password form fields", async ({ page }) => {
    await expect(page.locator("form")).toBeVisible();

    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Send recovery link" }),
    ).toBeVisible();
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

  test("should show validation error for invalid email", async ({ page }) => {
    await page.getByRole("button", { name: "Send recovery link" }).click();

    await expect(page).toHaveURL(/\/en\/auth\/forgot-password$/);

    await expect(
      page.getByText("Enter a valid email address.", {
        exact: true,
      }),
    ).toBeVisible();
  });
});
