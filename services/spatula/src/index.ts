import { createDriver, init2Captcha } from "@/driver";
import { auth, type AuthRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { actionLogger, responseLogger } from "@/lib/log";
import { determineURLRegion } from "@/lib/utils";
import { getFullItem } from "@/scraper";
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import webdriver from "selenium-webdriver";

export const log = actionLogger();

interface DriverInstances {
	eu: webdriver.WebDriver | null;
	us: webdriver.WebDriver | null;
}

export const driver = {
	eu: null,
	us: null,
} as DriverInstances;

export const app = express();

export const googleGenAI = new GoogleGenerativeAI(env.AI_STUDIO_API_KEY);

// @ts-expect-error todo: fix
app.use(responseLogger);

async function main() {
	const usProxy = await db.proxy.findFirst({
		where: {
			region: "us",
		},
	});
	const euProxy = await db.proxy.findFirst({
		where: {
			region: "eu",
		},
	});
	if (!usProxy || !euProxy) {
		log.error("No proxies found, please add one and re-run service");
		return;
	}

	driver.eu = await createDriver({ proxy: euProxy.url });

	await init2Captcha({ driver: driver.eu });

	log.info("EU driver ready");

	driver.us = await createDriver({ proxy: usProxy.url });

	await init2Captcha({ driver: driver.us });

	log.info("US driver ready");

	log.info("Browsers are ready for resolving requests");

	return;
}

main();

// @ts-expect-error todo: fix
app.get("/item", auth, async (req: AuthRequest, res) => {
	if (!req.query.url) {
		return res.status(400).json({ status: "error", message: "No URL provided" });
	}

	const url = decodeURIComponent(req.query.url as string);
	// prompt injection for determineURLRegion prevention
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		return res.status(400).json({ status: "error", message: "URL must not contain http or https" });
	}

	try {
		const urlRegion = (await determineURLRegion({ url, googleGenAI })).region;

		const regionalDriver = driver[urlRegion];

		if (regionalDriver === null) {
			log.error(`Request failed due to driver for region ${urlRegion} being not initialized`);
			return res.status(500).json({ status: "error", message: "Internal server error" });
		}

		const item = await getFullItem({
			driver: regionalDriver,
			url,
			googleGenAI,
		});
		return res.json({ status: "success", item });
	} catch (error) {
		log.error(`Request failed ${JSON.stringify(error)}`);
		return res.status(500).json({ status: "error", message: "Internal server error" });
	}
});

app.listen(parseInt(env.PORT), () => {
	log.info(`Server is running on port ${env.PORT}`);
});
