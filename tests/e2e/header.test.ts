import { expect, test } from "@playwright/test";
import { dismissCookies } from "./helpers";

const SOCIALS = [
  { name: /github/i, href: /github\.com/i },
  { name: /linkedin/i, href: /linkedin\.com/i },
] as const;

test.describe("Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
    await dismissCookies(page);
  });

  test("should render name and role", async ({ page }) => {
    const hero = page.getByTestId("hero");
    await expect(
      hero.getByRole("heading", { level: 1, name: "Victor Zarzar" }),
    ).toBeVisible();
    await expect(
      hero.getByRole("heading", { level: 2, name: /full stack developer/i }),
    ).toBeVisible();
  });

  test("should render social buttons with correct links", async ({ page }) => {
    const hero = page.getByTestId("hero");
    for (const { name, href } of SOCIALS) {
      const link = hero.getByRole("link", { name });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", href);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });

  for (const { name, href } of SOCIALS) {
    test(`should open ${name.source} link in new tab`, async ({
      page,
      context,
    }) => {
      await context.route(href, (route) =>
        route.fulfill({ contentType: "text/html", body: "<html></html>" }),
      );
      const link = page.getByTestId("hero").getByRole("link", { name });
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        link.click(),
      ]);
      await expect(popup).toHaveURL(href);
      await expect(page).toHaveURL(/\/en\/?$/);
    });
  }
});
