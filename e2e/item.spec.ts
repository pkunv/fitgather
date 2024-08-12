import { expect, test } from "@playwright/test";

test("adding item - zalando PL", async ({ page }) => {
  const url = `https://www.zalando.pl/carhartt-wip-pepe-bhc-t-shirt-z-nadrukiem-ner-c1422o0ud-q11.html`;

  await page.goto("/");

  // Click the get started link.
  await page.getByLabel("top clothing item button").first().click(); // first is the form, second is the tutorial
  await page.getByLabel("Item web address").first().fill(url);

  await page.getByRole("button", { name: "Add" }).first().click();

  await expect(
    page.getByAltText("top clothing item image").first(),
  ).toBeVisible();
});

test("adding item - zalando NL", async ({ page }) => {
  const url = `https://www.zalando.nl/conbipel-printed-overhemd-azzurro-c4i22d0c5-k11.html`;

  await page.goto("/");

  // Click the get started link.
  await page.getByLabel("top clothing item button").first().click(); // first is the form, second is the tutorial
  await page.getByLabel("Item web address").first().fill(url);

  await page.getByRole("button", { name: "Add" }).first().click();

  await expect(
    page.getByAltText("top clothing item image").first(),
  ).toBeVisible();
});

test("adding item - vinted PL", async ({ page }) => {
  const url = `https://www.vinted.pl/items/4877872686-bluzka-kamizelka-zapinana-na-guziki?homepage_session_id=02502244-b3ff-4f60-be5d-d52d558fa6e0`;

  await page.goto("/");

  // Click the get started link.
  await page.getByLabel("top clothing item button").first().click(); // first is the form, second is the tutorial
  await page.getByLabel("Item web address").first().fill(url);

  await page.getByRole("button", { name: "Add" }).first().click();

  await expect(
    page.getByAltText("top clothing item image").first(),
  ).toBeVisible();
});
