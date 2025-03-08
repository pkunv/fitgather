import { db } from "@/lib/db";
import { createDriver } from "@/lib/driver";
import { env } from "@/lib/env";
import { actionLogger } from "@/lib/log";
import { determineURLRegion } from "@/lib/utils";
import { getFullItem } from "@/scraper";
import { GoogleGenerativeAI } from "@google/generative-ai";
import webdriver from "selenium-webdriver";
import { parentPort, workerData } from "worker_threads";

const id = workerData.id;
export const log = actionLogger(id.substring(0, 9) + "...");

interface DriverRegionals {
	eu: webdriver.WebDriver | null;
	us: webdriver.WebDriver | null;
}

export const driver = {
	eu: null,
	us: null,
} as DriverRegionals;

export const googleGenAI = new GoogleGenerativeAI(env.AI_STUDIO_API_KEY);

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

	//await init2Captcha({ driver: driver.eu });

	log.info("EU driver available");

	driver.us = await createDriver({ proxy: usProxy.url });

	//await init2Captcha({ driver: driver.us });

	log.info("US driver available");

	log.info(`Resolver is available for resolving requests`);

	await db.resolver.update({
		where: {
			id,
		},
		data: {
			isAvailable: true,
		},
	});

	return;
}

main();

parentPort?.on("message", async (message) => {
	await db.resolver.update({
		where: {
			id,
		},
		data: {
			requestsInQueue: {
				increment: 1,
			},
		},
	});
	const { requestId, url } = message;

	const urlRegion = (await determineURLRegion({ url, googleGenAI })).region;

	const regionalDriver = driver[urlRegion];

	if (regionalDriver === null) {
		parentPort?.postMessage({ status: "error" });
		log.error(`Request failed due to driver for region ${urlRegion} being not initialized`);
		return;
	}

	const item = await getFullItem({
		driver: regionalDriver,
		url,
		googleGenAI,
	});

	parentPort?.postMessage({ status: "success", item, requestId });

	await db.resolver.update({
		where: {
			id,
		},
		data: {
			lastRequestAt: new Date(),
			requestsInQueue: {
				decrement: 1,
			},
		},
	});
});
