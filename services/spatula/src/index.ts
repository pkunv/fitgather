import { createDriver, init2Captcha } from "@/driver";
import { auth, type AuthRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { actionLogger, responseLogger } from "@/lib/log";
import { getFullItem } from "@/scraper";
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import webdriver from "selenium-webdriver";

export const log = actionLogger();
export let driver: webdriver.WebDriver | null = null;
export const app = express();

export const googleGenAI = new GoogleGenerativeAI(env.AI_STUDIO_API_KEY);

// @ts-expect-error todo: fix
app.use(responseLogger);

async function main() {
	const proxies = await db.proxy.findMany();
	if (proxies.length === 0) {
		log.error("No proxies found, please add one and re-run service");
		return;
	}

	const { url } = proxies[Math.floor(Math.random() * proxies.length)];

	driver = await createDriver({ proxy: url });

	await init2Captcha({ driver });

	log.info("Browser is ready for resolving requests");

	return;
}

main();

// @ts-expect-error todo: fix
app.get("/item", auth, async (req: AuthRequest, res) => {
	if (!req.query.url) {
		return res.status(400).json({ status: "error", message: "No URL provided" });
	}
	const url = decodeURIComponent(req.query.url as string);

	if (!driver) {
		log.error("Request failed due to driver being not initialized");
		return res.status(500).json({ status: "error", message: "Internal server error" });
	}

	try {
		const item = await getFullItem({
			driver,
			url,
			googleGenAI,
		});
		return res.json({ status: "success", item });
	} catch (error) {
		log.error(`Request failed ${JSON.stringify(error)}`);
		return res.status(500).json({ status: "error", message: "Internal server error" });
	}
});

app.listen(3000, () => {
	log.info("Listening on port 3000");
});
