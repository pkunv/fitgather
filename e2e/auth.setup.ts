import { expect, test as setup } from "@playwright/test";

import dotenv from "dotenv";

const authFile = "e2e/.auth/user.json";

dotenv.config({ path: "../../apps/www/.env" });

setup("authenticate", async ({ page }) => {
	if (process.env.E2E_USERNAME === undefined || process.env.E2E_PASSWORD === undefined) {
		throw new Error("E2E_USERNAME and E2E_PASSWORD environment variables must be set");
	}

	await page.goto("/");
	await page.getByRole("link", { name: "Sign in" }).click();
	await page.getByLabel("Username").fill(process.env.E2E_USERNAME);
	await page.getByRole("button", { name: "Continue" }).click();
	await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_PASSWORD);
	await page.getByRole("button", { name: "Continue", exact: true }).click();

	await expect(page.getByRole("link", { name: "My outfits" })).toBeVisible();

	await page.context().storageState({ path: authFile });
});
