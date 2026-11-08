import type { Page } from "@playwright/test";

export async function dismissCookies(page: Page) {
  const accept = page.getByRole("button", { name: /accept/i });

  await accept
    .waitFor({ state: "visible", timeout: 2_000 })
    .then(() => accept.click())
    .catch(() => {
      null;
    });
}
