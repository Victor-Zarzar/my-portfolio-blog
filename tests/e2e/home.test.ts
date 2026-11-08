import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { dismissCookies } from "./helpers";

const TEASERS = [
  {
    section: "projects",
    heading: /featured projects/i,
    cta: /see all projects/i,
    url: /\/projects$/,
  },
  {
    section: "about",
    heading: /about me/i,
    cta: /learn more/i,
    url: /\/about$/,
  },
  {
    section: "contact",
    heading: /let's work together/i,
    cta: /get in touch/i,
    url: /\/contact$/,
  },
] as const;

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("home page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(en|pt|es)$/);
    await expect(page).toHaveTitle(/victor|portfolio/i);
  });

  test("should render a single main heading", async ({ page }) => {
    await page.goto("/en");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toBeVisible();
  });

  test.describe("teasers", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/en");
      await dismissCookies(page);
    });

    for (const { section, heading, cta, url } of TEASERS) {
      test(`${section} teaser should navigate to its page`, async ({
        page,
      }) => {
        await expect(
          page.getByRole("heading", { level: 2, name: heading }),
        ).toBeVisible();
        await page.getByRole("link", { name: cta }).click();
        await expect(page).toHaveURL(url);
      });
    }
  });

  test.describe("layout", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/en");
      await dismissCookies(page);
    });

    test("should not overflow horizontally on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await expectNoHorizontalScroll(page);
    });

    test("should not overflow horizontally on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await expectNoHorizontalScroll(page);
    });
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test.describe(`hydration (${colorScheme})`, () => {
      test.use({ colorScheme });
      test("should hydrate without errors", async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() === "error") {
            errors.push(msg.text());
          }
        });
        page.on("pageerror", (err) => errors.push(err.message));
        await page.goto("/en");
        await page.waitForLoadState("networkidle");
        const hydration = errors.filter((e) =>
          /hydrat|Minified React error #(418|419|422|423|425)/i.test(e),
        );
        expect(hydration).toEqual([]);
      });
    });
  }
});

const PUBLIC_ROUTES = [
  "/en",
  "/en/about",
  "/en/projects",
  "/en/blog",
  "/en/contact",
  "/en/privacypolicy",
];

test.describe("document outline", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} should have exactly one h1`, async ({ page }) => {
      await page.goto(route);
      const h1 = page.getByRole("heading", { level: 1 });
      await expect
        .poll(() => h1.allTextContents(), { message: `h1 on ${route}` })
        .toHaveLength(1);
    });
  }
});
