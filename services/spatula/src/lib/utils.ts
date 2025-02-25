import { log } from "@/index";
import type { GoogleGenerativeAI } from "@google/generative-ai";

export async function timeout(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function determineURLRegion({
	url,
	googleGenAI,
}: {
	url: string;
	googleGenAI: GoogleGenerativeAI;
}) {
	try {
		let responseText: string | null = null;

		const startTime = Date.now();

		const model = googleGenAI.getGenerativeModel({ model: "gemini-2.0-flash" });
		const msg = model.generateContent({
			systemInstruction: `
					You are a URL region detector. Your task is to analyze URLs and determine their geographical region based on URL patterns. 
					IMPORTANT RULES:
					1. Analyze the following URL components for region detection:
						- Subdomains (e.g., us.domain.com, uk.domain.com)
						- Directory paths (e.g., /de_de/, /en-gb/)
						- TLD domains (e.g., .co.uk, .de, .fr)

					2. Common patterns to check:
						- Country-specific subdomains (us., uk., de.)
						- Region directories (de_de, en_us, fr_fr)
						- Country codes in paths (/us/, /uk/, /de/)
						- Locale parameters (?locale=us, ?country=de)

					3. Region mapping:
						- US indicators: 'us', 'en_us', 'en-us'
						- EU indicators: 'de', 'fr', 'it', 'es', 'nl', 'uk', 'gb', 'eu'

					4. Response format:
						- Must return ONLY a JSON object
						- Must use the exact structure: {"region": "us"} or {"region": "eu"}
						- No additional text or explanations
						- No markdown formatting

					5. Default behavior:
						- If no region is clearly identifiable, default to {"region": "eu"}
						- If multiple regions are found, prioritize the first occurrence

					Example input:
					https://us.example.com/product
					Expected output:
					{"region": "us"}

					Example input:
					https://example.com/de_de/product
					Expected output:
					{"region": "eu"}
								`,
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `
									Fill the following JSON structure, maintain this exact format:
									{
										"region": String,
									}
									Determine and detect geo region of this URL: ${url}`,
						},
					],
				},
			],
			generationConfig: {
				maxOutputTokens: 64,
				temperature: 0,
			},
		});

		responseText = (await msg).response.text().replaceAll("```json", "").replaceAll("```", "");

		log.info(`AI response: \n ${responseText}`);

		log.info(`Total time to determine geo region of requested URL: ${Date.now() - startTime}ms`);

		const response: {
			region: "us" | "eu";
		} = JSON.parse(responseText);
		return response;
	} catch (e) {
		log.error(`Failed to get AI response: ${e}`);
		throw e;
	}
}
