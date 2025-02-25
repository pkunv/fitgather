import { getPageContent } from "@/driver";
import { log } from "@/index";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { load } from "cheerio";
import { minify } from "html-minifier-terser";
import webdriver from "selenium-webdriver";

export async function getFullItem({
	driver,
	url,
	googleGenAI,
}: {
	driver: webdriver.WebDriver;
	url: string;
	googleGenAI: GoogleGenerativeAI;
}) {
	log.info(`Getting full item from ${url}`);
	const startTime = Date.now();

	await driver.get(url);

	const pageSource = await getPageContent(driver, url);

	// ... after getting page source
	const pageSourceTime = Date.now();
	log.info(`Time to get page source: ${pageSourceTime - startTime}ms`);

	log.info(`Page size before filtering: ${Buffer.byteLength(pageSource, "utf8") / 1024}KB`);

	// filtering html source page content //
	const $ = load(pageSource);

	$("script, style, iframe, noscript, svg").remove();

	const filteredPageSource = await minify($.html(), {
		removeAttributeQuotes: true,
		removeComments: true,
	});

	// ... after filtering page source
	const filterTime = Date.now();
	log.info(`Time to filter page source: ${filterTime - pageSourceTime}ms`);

	log.info(`Page size after filtering: ${Buffer.byteLength(filteredPageSource, "utf8") / 1024}KB`);

	const testFilteredPageSource = filteredPageSource.toLocaleLowerCase();

	// checking for prompt injection
	if (
		testFilteredPageSource.includes("ignore all previous instructions") ||
		testFilteredPageSource.includes("ignore previous instructions") ||
		testFilteredPageSource.includes("ignore previously given instructions") ||
		testFilteredPageSource.includes("forget all previous instructions") ||
		testFilteredPageSource.includes("forget previous instructions") ||
		testFilteredPageSource.includes("forget previously given instructions") ||
		testFilteredPageSource.includes("ignore everything between these quotes") ||
		testFilteredPageSource.includes("forget everything between these quotes")
	) {
		throw new Error("Page contains possible prompt injection");
	}

	try {
		let responseText: string | null = null;

		const model = googleGenAI.getGenerativeModel({ model: "gemini-2.0-flash" });
		const msg = model.generateContent({
			systemInstruction: `
							You are a specialized e-commerce parser. When given HTML source code from clothing product pages, extract and return a clean JSON object with the following structure:
							{
							'merchant': '', // Store/Company name
							'brand': '', // Brand name if different from merchant
							'productName': '', // Full product title
							'price': '', // Current price (numeric only)
							'currency': '', // Currency code (e.g., USD, EUR, PLN, CNY, etc.)
							'imageUrl': '', // Primary product image or og:image
							}

							Look for these data points in:

									structured data (schema.org/Product)
									meta tags (especially og: and product-specific)
									standard HTML elements with common e-commerce classes/IDs
									microdata attributes

							Return only these specific attributes in valid JSON format, with null for any missing values.
							`,
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `
								Fill the following JSON structure, maintain this exact format:
								{
									"merchant": String,
									"brand": String,
									"productName": String,
									"price": Number,
									"currency": String,
									"imageUrl": String,
								}
								Extract product data from this clothing item webpage, please respond with JSON only: <html-source>${filteredPageSource}</html-source>`,
						},
					],
				},
			],
			generationConfig: {
				maxOutputTokens: 512,
				temperature: 0,
			},
		});

		responseText = (await msg).response.text().replaceAll("```json", "").replaceAll("```", "");

		log.info(`AI response: \n ${responseText}`);

		// ... after getting AI response
		log.info(`Time to get AI response: ${Date.now() - filterTime}ms`);
		log.info(`Total time: ${Date.now() - startTime}ms`);

		// switching to blank page to minimize proxy transfer usage after request
		await driver.get("about:blank");

		const response: {
			merchant: string;
			brand: string;
			productName: string;
			price: number;
			currency: string;
			imageUrl: string;
		} = JSON.parse(responseText);
		return response;
	} catch (e) {
		log.error(`Failed to get AI response: ${e}`);
		throw e;
	}
}
