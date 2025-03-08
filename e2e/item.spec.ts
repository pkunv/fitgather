import { expect, test } from "@playwright/test";

test("adding item - zalando PL", async ({ page }) => {
	const url = `https://www.zalando.pl/kaffe-kalizza-t-shirt-basic-soft-silt-ka321d0h7-o11.html`;

	await page.goto("/");

	// Click the get started link.
	await page.getByLabel("top clothing item button").first().click(); // first is the form, second is the tutorial
	await page.getByLabel("Item web address").first().fill(url);

	await page.getByRole("button", { name: "Add" }).first().click();

	await expect(page.getByAltText("top clothing item image").first()).toBeVisible();
});

test("adding item - zalando NL", async ({ page }) => {
	const url = `https://www.zalando.nl/polo-club-poloshirt-navy-pot22o00z-k13.html`;

	await page.goto("/");

	// Click the get started link.
	await page.getByLabel("top clothing item button").first().click(); // first is the form, second is the tutorial
	await page.getByLabel("Item web address").first().fill(url);

	await page.getByRole("button", { name: "Add" }).first().click();

	await expect(page.getByAltText("top clothing item image").first()).toBeVisible();
});

test("adding item - vinted PL", async ({ page }) => {
	const url = `https://www.vinted.pl/items/5931976580-majica-kratkih-rukava?referrer=catalog`;

	await page.goto("/");

	// Click the get started link.
	await page.getByLabel("top clothing item button").first().click(); // first is the form, second is the tutorial
	await page.getByLabel("Item web address").first().fill(url);

	await page.getByRole("button", { name: "Add" }).first().click();

	await expect(page.getByAltText("top clothing item image").first()).toBeVisible();
});
