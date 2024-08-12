import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Home / fitgather");
});

test("has supported shops page", async ({ page }) => {
  await page.goto("/supported-shops");

  await page.getByRole("link", { name: "Zalando" }).click();

  await expect(page).not.toHaveTitle("fitgather");
});
