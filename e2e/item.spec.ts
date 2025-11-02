import { expect, test } from "@playwright/test";

test("adding item - zalando PL", async ({ page }) => {
  const url = `https://www.zalando.pl/hugo-naolo-2-pack-t-shirt-basic-black-hu722o0o3-q11.html`;

  await page.goto("/");

  // Click the get started link.
  await page.getByLabel("top clothing item button").first().click(); // first is the form, second is the tutorial
  await page.getByLabel("Item web address").first().fill(url);

  await page.getByRole("button", { name: "Add" }).first().click();

  await expect(
    page.getByAltText("top clothing item image").first(),
  ).toBeVisible({
    timeout: 30000,
  });
});

test("adding item - zalando NL", async ({ page }) => {
  const url = `https://www.zalando.nl/polo-club-poloshirt-navy-pot22o00z-k13.html`;

  await page.goto("/");

  // Click the get started link.
  await page.getByLabel("top clothing item button").first().click(); // first is the form, second is the tutorial
  await page.getByLabel("Item web address").first().fill(url);

  await page.getByRole("button", { name: "Add" }).first().click();

  await expect(
    page.getByAltText("top clothing item image").first(),
  ).toBeVisible({
    timeout: 40000,
  });
});

test("adding item - vinted PL", async ({ page }) => {
  const url = `https://www.vinted.pl/items/7465422631-skorzana-kurtka-zara?homepage_session_id=c9c24ac6-df8e-40b2-844e-95b1bc7c71f9`;

  await page.goto("/");

  // Click the get started link.
  await page.getByLabel("top clothing item button").first().click(); // first is the form, second is the tutorial
  await page.getByLabel("Item web address").first().fill(url);

  await page.getByRole("button", { name: "Add" }).first().click();

  await expect(
    page.getByAltText("top clothing item image").first(),
  ).toBeVisible({
    timeout: 40000,
  });
});
