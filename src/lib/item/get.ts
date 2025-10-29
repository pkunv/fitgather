/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { env } from "@/env";
import { getItemHTML } from "@/lib/item/scrape";
import { ai } from "@/server/ai";
import { Type } from "@google/genai";

export async function getItem(url: string) {
  const html = await getItemHTML(url);

  const contentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: `You are a specialized e-commerce parser. When given HTML source code from clothing product pages, extract and return useful product information, using given schema.Look for these data points in:

									structured data (schema.org/Product)
									meta tags (especially og: and product-specific)
									standard HTML elements with common e-commerce classes/IDs
									microdata attributes`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ["head", "top", "bottom", "shoes"],
            description: "Type of clothing item (head, top, bottom, shoes)",
          },
          accessory: {
            type: Type.BOOLEAN,
            description:
              "Boolean indicating if the item is an accessory or outerwear (true) or not (false)",
          },
          merchant: {
            type: Type.STRING,
            description: "Store/Company name",
          },
          brand: {
            type: Type.STRING,
            description: "Brand name if different from merchant ",
          },
          productName: {
            type: Type.STRING,
            description: "Full product title",
          },
          price: {
            type: Type.NUMBER,
            description: "Current price (numeric only)",
          },
          currency: {
            type: Type.STRING,
            description: "Currency code (e.g., USD, EUR, PLN, CNY, etc.)",
          },
          imageUrl: {
            type: Type.STRING,
            description: "Primary product image or og:image",
          },
          isClothing: {
            type: Type.BOOLEAN,
            description:
              "Boolean indicating if the page is presenting a product in the clothing category",
          },
        },
      },
    },
    contents: `Extract product data from this clothing item webpage, please respond with JSON only: <html-source>${html}</html-source>`,
  });

  const data = JSON.parse(contentResponse.text ?? "{}") as unknown as {
    type: string | null;
    accessory: boolean | null;
    merchant: string | null;
    brand: string | null;
    productName: string | null;
    price: number | null;
    currency: string | null;
    imageUrl: string | null;
    isClothing: boolean | null;
  };

  const item = {
    type: data.type ?? "top",
    accessory: data.accessory ?? false,
    merchant: data.merchant ?? "unknown",
    title: data.productName ?? "",
    brand: data.brand ?? "",
    price: data.price ?? 0,
    currency: data.currency ?? "",
    imageUrl: data.imageUrl?.startsWith("//")
      ? `https:${data.imageUrl}`
      : (data.imageUrl ?? ""),
    description: "",
    isClothing: data.isClothing ?? false,
    image: "", // final uploadcare imageurl
    provider: data.merchant ?? "unknown",
  };

  item.provider = item.merchant;

  if (item.imageUrl && item.isClothing) {
    const res = await fetch(item.imageUrl);
    const mimeType = res.headers.get("content-type");
    const buffer = await res.arrayBuffer();
    const imageData = Buffer.from(buffer).toString("base64");

    const prompt = `You are a fashion description specialist. Create a brief, simple description of clothing items using the following guidelines:
          1. Use a comma-separated format
          2. Start with color and basic item type
          3. Include only key distinctive features (fit, notable design elements, primary details)
          4. Keep descriptions between 3-6 key elements
          5. Use common, straightforward terms
          6. Focus on the most immediately noticeable characteristics
          7. Include possible subculture, trend or music genre related to the item

          Examples of expected output format:
          - "black t-shirt, oversized, small logo, imprint, masculine fitting, subculture: hip-hop"
          - "white t-shirt, adjacent tight fit, small logo, target audience: gym enthusiasts, subculture: fitness"
          - "blue jeans, straight cut, distressed, high waist, subculture: grunge, casual, streetwear"
          - "white hoodie, zip-up, basic, regular fit, subculture: streetwear, casual"
          - "black hoodie with white gothic print, oversized, subculture: edgy, 'opium', rage trap"

          Provide descriptions in this simple, direct style using only the most essential identifying features.`;
    const image = {
      inlineData: {
        data: imageData,
        mimeType: mimeType ?? "image/jpeg",
      },
    };

    const visionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: prompt,
      },
      contents: [
        {
          ...image,
        },
        {
          text: "Please describe this clothing item, without unnecessary introduction.",
        },
      ],
    });

    item.description = visionResponse.text ?? "";
  }

  if (!item.imageUrl) {
    item.image =
      "https://ucarecdn.com/f994fc46-eec7-47a1-a72e-707e83c36c9a/noimg.png";
  } else {
    try {
      const formData = new FormData();
      formData.append("pub_key", env.UPLOADCARE_PUBLIC_KEY);
      formData.append("source_url", item.imageUrl);
      formData.append("metadata[subsystem]", "uploader");

      const res = await fetch(`https://upload.uploadcare.com/from_url/`, {
        method: "POST",
        body: formData,
      });

      const result = (await res.json()) as { token: string };

      await new Promise((resolve) => setTimeout(resolve, 400));

      const status = await fetch(
        `https://upload.uploadcare.com/from_url/status?token=${result.token}`,
      );

      let statusResult = (await status.json()) as {
        file_id: string;
        status: "success" | "error" | "progress";
        filename: string;
      };

      if (statusResult.status === "error") {
        throw new Error("Failed to upload image to Uploadcare");
      }

      if (statusResult.status === "progress") {
        console.log("[item.create] Uploadcare status is progress");
        await new Promise((resolve) => setTimeout(resolve, 600));

        const renewedStatus = await fetch(
          `https://upload.uploadcare.com/from_url/status?token=${result.token}`,
        );
        statusResult = (await renewedStatus.json()) as {
          file_id: string;
          status: "success" | "error" | "progress";
          filename: string;
        };
        item.image = `https://ucarecdn.com/${statusResult.file_id}/${statusResult.filename}`;
        console.log(
          "[item.create] Uploadcare status is success after trying again",
        );
      }

      if (statusResult.status === "success") {
        item.image = `https://ucarecdn.com/${statusResult.file_id}/${statusResult.filename}`;
      }
    } catch (error) {
      item.image =
        "https://ucarecdn.com/f994fc46-eec7-47a1-a72e-707e83c36c9a/noimg.png";
      item.description = "";
    }
  }

  // pretty print item
  console.log("[getItem] Item created: ", JSON.stringify(item, null, 2));

  return item;
}
