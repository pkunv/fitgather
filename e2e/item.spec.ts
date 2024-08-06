import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Home / fitgather");
});

test("adding item", async ({ page }) => {
  await page.goto("/");

  // Click the get started link.
  await page.getByLabel("top clothing item button").click();
  await page
    .getByLabel("Item web address")
    .fill("https://www.zalando.pl/mango-koszula-khaki-m9122d2qa-n11.html");

  await page.getByRole("button", { name: "Add" }).click();

  await expect(page.getByAltText("top clothing item image")).toBeVisible();
});
