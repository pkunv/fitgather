import { log } from "@/index";
import { env } from "@/lib/env";
import { timeout as _timeout } from "@/lib/utils";
import webdriver, { By } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

export async function createDriver({ proxy }: { proxy: string }) {
	/*
  // TODO: selenium-with-fingerprints (needs windows machine)
	const options = new Options();

	options.addExtensions(path.join(process.cwd(), "src", "__ext", "2captchasolver.crx"));

	plugin.setServiceKey(env.FINGERPRINT_KEY);

	plugin.useBrowserVersion("129.0.6668.59");

	log.info("fetching fingerprint");

	const fingerprint = await plugin.fetch({
		tags: ["Chrome", "Microsoft Windows"],
		maxBrowserVersion: "current",
		minBrowserVersion: "current",
		timeLimit: "15 days",
	});

	log.info("fingerprint fetched");

	plugin.useProxy(proxy, {
		changeTimezone: true,
		changeGeolocation: true,
		changeWebRTC: true,
	});

	plugin.useFingerprint(fingerprint);

	const driver = await plugin.launch({
		builder: new Builder()
			.forBrowser("chrome")
			.setChromeOptions(options)
			.setChromeService(new chrome.ServiceBuilder(path.join(process.cwd(), "uc.exe"))),
	});

	log.info("driver launched");

	await driver.manage().setTimeouts({ implicit: 5000 });

	return driver as webdriver.WebDriver;
  */
	const options = new chrome.Options();
	options.addExtensions(process.cwd() + "/src/__ext/2captchasolver.crx");
	const driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

	await driver.manage().setTimeouts({ implicit: 5000 });

	return driver;
}

export async function init2Captcha({ driver }: { driver: webdriver.WebDriver }) {
	driver.get("chrome-extension://ifibfemgeogfhoebkmokieepdoobkbpo/options/options.html");

	await sendKeys({
		driver,
		xpath: `/html/body/div/div[1]/table/tbody/tr[1]/td[2]/input`,
		text: env.TWOCAPTCHA_API_KEY,
	});

	await moveAndClick({ xpath: `//*[@id="autoSubmitForms"]`, driver });

	await moveAndClick({
		xpath: `/html/body/div/form/div[1]/table/tbody/tr[3]/td/div[1]/div[1]`,
		driver,
	});

	await moveAndClick({
		xpath: "/html/body/div/form/div[1]/table/tbody/tr[3]/td/div[1]/div[2]/div/div[4]",
		driver,
	});

	await moveAndClick({
		xpath: "/html/body/div/form/div[1]/table/tbody/tr[3]/td/div[2]/div[1]/span[2]",
		driver,
	});

	await moveAndClick({
		xpath: "/html/body/div/form/div[1]/table/tbody/tr[3]/td/div[2]/div[2]/div/div[3]",
		driver,
	});

	await moveAndClick({
		xpath: "/html/body/div/form/div[2]/table/tbody/tr[14]/td[2]/div[2]/input",
		driver,
	});

	await moveAndClick({
		xpath: "/html/body/div/form/div[2]/table/tbody/tr[6]/td[2]/div[2]/input",
		driver,
	});

	await moveAndClick({ xpath: `//*[@id="connect"]`, driver });
	try {
		await waitForAlert(driver);
	} catch (e) {
		log.error(`2captcha init error`).throwError();
	}

	const alert = await driver.switchTo().alert();
	const textAlert = await alert.getText();
	if (!textAlert.includes("success")) {
		log.error(`2captcha init error`).throwError();
	}
	await alert.accept();
}

export async function moveAndClick({
	driver,
	xpath,
	id,
	css,
	duration = 1000,
}: {
	driver: webdriver.WebDriver;
	xpath?: string;
	id?: string;
	css?: string;
	duration?: number;
}): Promise<void> {
	let selector = null;
	if (xpath) {
		selector = By.xpath(xpath);
	} else if (id) {
		selector = By.id(id);
	} else if (css) {
		selector = By.css(css);
	}
	if (!selector) {
		throw new Error("No selector provided");
	}
	const element = await driver.findElement(selector);
	return await driver.actions().move({ origin: element, duration }).click().perform();
}

export async function typeToElement({
	driver,
	xpath,
	text,
	id,
	css,
	timeout = 100,
}: {
	driver: webdriver.WebDriver;
	xpath?: string;
	text: string;
	id?: string;
	css?: string;
	timeout?: number;
}): Promise<void> {
	return new Promise<void>((resolve) => {
		(async () => {
			let selector = null;
			if (xpath) {
				selector = By.xpath(xpath);
			} else if (id) {
				selector = By.id(id);
			} else if (css) {
				selector = By.css(css);
			}
			if (!selector) {
				throw new Error("No selector provided");
			}
			const element = await driver.findElement(selector);
			const chars = Array.from(text);
			for (let i = 0; i < chars.length; i++) {
				await element.sendKeys(chars[i]);
				await _timeout(timeout);
			}
			await _timeout(400);
			resolve();
		})();
	});
}

export async function sendKeys({
	driver,
	xpath,
	text,
	id,
	css,
}: {
	driver: webdriver.WebDriver;
	xpath?: string;
	text: string;
	id?: string;
	css?: string;
}) {
	let selector = null;
	if (xpath) {
		selector = By.xpath(xpath);
	} else if (id) {
		selector = By.id(id);
	} else if (css) {
		selector = By.css(css);
	}
	if (!selector) {
		throw new Error("No selector provided");
	}
	const element = await driver.findElement(selector);
	await element.sendKeys(text);
}

export function waitForAlert(driver: webdriver.WebDriver) {
	return new Promise<void>((resolve) => {
		const interval = setInterval(async () => {
			try {
				await driver.switchTo().alert();
				resolve();
				clearInterval(interval);
				// eslint-disable-next-line no-empty, @typescript-eslint/no-unused-vars
			} catch (e) {}
		}, 1000);
	});
}

export async function checkForElement({
	driver,
	xpath,
	tries = 120,
}: {
	driver: webdriver.WebDriver;
	xpath: string;
	tries?: number;
}) {
	if (tries === 0) {
		throw new Error("Element check tries exceeded");
	}
	try {
		await driver.findElement(By.xpath(xpath));
		log.info("Element found");
		return true;
	} catch (e) {
		log.info("Element not found, retrying");
		await _timeout(100);
		return await checkForElement({ driver, xpath, tries: tries - 1 });
	}
}
