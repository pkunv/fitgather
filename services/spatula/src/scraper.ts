import { Anthropic } from "@anthropic-ai/sdk";
import webdriver from "selenium-webdriver";

export async function getFullItem({
	driver,
	url,
	anthropic,
}: {
	driver: webdriver.WebDriver;
	url: string;
	anthropic: Anthropic;
}) {
	await driver.switchTo().newWindow("tab");

	await driver.get(url);

	const pageSource = (await driver.executeScript(
		`document.querySelector('html').innerHTML`
	)) as string;

	// close tab
	await driver.close();

	const msg = await anthropic.messages.create({
		model: "claude-3-5-haiku-20241022",
		max_tokens: 512,
		temperature: 0,
		system: `
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
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
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
            Extract product data from this clothing item webpage: <html-source>${pageSource}</html-source>`,
					},
				],
			},
		],
	});

	const response: {
		merchant: string;
		brand: string;
		productName: string;
		price: number;
		currency: string;
		imageUrl: string;
		// @ts-expect-error this should work
	} = JSON.parse(msg.content[0].text);

	return response;
}
