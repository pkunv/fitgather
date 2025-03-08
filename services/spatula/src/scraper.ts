import { getPageContent } from "@/lib/driver";
import { log } from "@/resolver";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { load } from "cheerio";
import { minify } from "html-minifier-terser";
import fetch from "node-fetch";
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
							'isClothing': '', // Boolean indicating if the page is presenting a product in the clothing category
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
									"isClothing": Boolean
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

		const response: {
			merchant: string | null;
			brand: string | null;
			productName: string | null;
			price: number | null;
			currency: string | null;
			imageUrl: string | null;
			description?: string;
			isClothing: boolean | null;
		} = JSON.parse(responseText);

		// adjustment to the response
		response.price = response.price ? parseFloat(response.price.toString()) : null;

		if (response.imageUrl && response.imageUrl.startsWith("//")) {
			response.imageUrl = "https:" + response.imageUrl;
		}

		if (response.brand === null && response.merchant !== null) {
			response.brand = response.merchant;
		}

		// fetch photo if it exists
		const photoUrl = response.imageUrl;
		if (photoUrl && response.isClothing) {
			const res = await fetch(photoUrl);
			const mimeType = res.headers.get("content-type");
			const buffer = await res.buffer();
			const imageData = buffer.toString("base64");

			const prompt = `You are a fashion description specialist. Create a brief, simple description of clothing items using the following guidelines:
			1. Use a comma-separated format
			2. Start with color and basic item type
			3. Include only key distinctive features (fit, notable design elements, primary details)
			4. Keep descriptions between 3-6 key elements
			5. Use common, straightforward terms
			6. Avoid complex fashion terminology
			7. Focus on the most immediately noticeable characteristics

			Examples of expected output format:
			- "black t-shirt, oversized, small logo, imprint, masculine fitting"
			- "blue jeans, straight cut, distressed, high waist"
			- "white hoodie, zip-up, basic, regular fit"

			Provide descriptions in this simple, direct style using only the most essential identifying features.`;
			const image = {
				inlineData: {
					data: imageData,
					mimeType: mimeType || "image/jpeg",
				},
			};

			const result = await model.generateContent({
				systemInstruction: prompt,
				contents: [
					{
						role: "user",
						parts: [
							{
								...image,
							},
							{
								text: "Please describe this clothing item, without unnecessary introduction.",
							},
						],
					},
				],
			});

			response.description = result.response.text();
		}

		log.info(`AI response: \n ${responseText}`);

		// ... after getting AI response
		log.info(`Time to get AI response: ${Date.now() - filterTime}ms`);
		log.info(`Total time: ${Date.now() - startTime}ms`);

		// switching to blank page to minimize proxy transfer usage after request
		await driver.get("about:blank");

		return response;
	} catch (e) {
		log.error(`Failed to get AI response: ${e}`);
		throw e;
	}
}
