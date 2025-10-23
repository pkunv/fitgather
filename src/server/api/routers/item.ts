/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { env } from "@/env";
import { googleGenAI } from "@/server/ai";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { itemSchema } from "@/trpc/schemas";
import { TRPCError } from "@trpc/server";
import { load } from "cheerio";
import { minify } from "html-minifier-terser";
import { z } from "zod";

export const itemRouter = createTRPCRouter({
  getMany: publicProcedure
    .input(z.object({ title: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.item.findMany({
        where: {
          title: {
            contains: input.title,
          },
        },
      });
    }),
  create: publicProcedure
    .input(itemSchema.create)
    .mutation(async ({ ctx, input }) => {
      // Check rate limit before proceeding using ResolvedItem timestamps
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const requestCount = await ctx.db.resolvedItem.count({
        where: {
          createdAt: {
            gte: oneHourAgo,
          },
        },
      });

      if (requestCount >= 25) {
        const lastRequest = await ctx.db.resolvedItem.findFirst({
          orderBy: {
            createdAt: "desc",
          },
        });

        if (lastRequest) {
          const nextAvailableTime = new Date(
            lastRequest.createdAt.getTime() + 60 * 60 * 1000,
          );
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `Oops! App is not available right now. Try again at: ${nextAvailableTime.toLocaleTimeString()}`,
          });
        }
      }

      // if any error occurs, it will be catched and a friendly error message will be returned
      try {
        const scraperResponse = await fetch(`https://api.zyte.com/v1/extract`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${env.ZYTE_API_KEY}:`).toString("base64")}`,
          },
          body: JSON.stringify({
            url: input.url,
            browserHtml: true,
          }),
        });
        if (!scraperResponse.ok) {
          throw new Error("Failed to fetch item from Zyte");
        }

        const { browserHtml } = (await scraperResponse.json()) as {
          browserHtml: string;
        };

        console.log(browserHtml);

        const $ = load(browserHtml);

        $("script, style, iframe, noscript, svg").remove();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const filteredPageHtml = await minify($.html(), {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
          removeEmptyElements: true,
          removeOptionalTags: true,
        });

        const filteredPageHtmlLowerCase = filteredPageHtml.toLowerCase();

        // checking for prompt injection
        if (
          filteredPageHtmlLowerCase.includes(
            "ignore all previous instructions",
          ) ||
          filteredPageHtmlLowerCase.includes("ignore previous instructions") ||
          filteredPageHtmlLowerCase.includes(
            "ignore previously given instructions",
          ) ||
          filteredPageHtmlLowerCase.includes(
            "forget all previous instructions",
          ) ||
          filteredPageHtmlLowerCase.includes("forget previous instructions") ||
          filteredPageHtmlLowerCase.includes(
            "forget previously given instructions",
          ) ||
          filteredPageHtmlLowerCase.includes(
            "ignore everything between these quotes",
          ) ||
          filteredPageHtmlLowerCase.includes(
            "forget everything between these quotes",
          ) ||
          filteredPageHtmlLowerCase.includes("act now as") ||
          filteredPageHtmlLowerCase.includes("god mode enabled")
        ) {
          throw new Error("Page contains possible prompt injection");
        }

        let responseText: string | null = null;

        const model = googleGenAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });
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
								Extract product data from this clothing item webpage, please respond with JSON only: <html-source>${filteredPageHtml}</html-source>`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 512,
            temperature: 0,
          },
        });

        responseText = (await msg).response.text();

        console.log("responseText", responseText);
        console.log("pagehtml", filteredPageHtml);
        /*
        const data = (await response.json()) as {
          status: "success" | "error";
          item: {
            merchant: string | null;
            brand: string;
            productName: string | null;
            price: number;
            currency: string;
            imageUrl: string | null;
            description?: string;
            isClothing: boolean | null;
            image: string; // for internal later use
            title: string; // for internal later use
            provider: string; // for internal later use to match the schema
          };
        };
        */

        const data = JSON.parse(responseText) as {
          merchant: string | null;
          brand: string | null;
          productName: string | null;
          price: number | null;
          currency: string | null;
          imageUrl: string | null;
          description?: string;
          isClothing: boolean | null;
        };

        const item = {
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

        // fetch photo if it exists
        const photoUrl = item.imageUrl;
        if (photoUrl && item.isClothing) {
          const res = await fetch(photoUrl);
          const mimeType = res.headers.get("content-type");
          const buffer = await res.arrayBuffer();
          const imageData = Buffer.from(buffer).toString("base64");

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
              mimeType: mimeType ?? "image/jpeg",
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

          item.description = result.response.text();
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

            const status = await fetch(
              `https://upload.uploadcare.com/from_url/status?token=${result.token}`,
            );

            const statusResult = (await status.json()) as {
              file_id: string;
              status: "success" | "error" | "progress";
              filename: string;
            };

            if (statusResult.status === "error") {
              throw new Error("Failed to upload image to Uploadcare");
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

        // as a security measure insert a record to db
        // to confirm later (while creating an outfit) that the item properties are valid
        // if there is a mismatch during the creation of an outfit, error will be thrown
        await ctx.db.resolvedItem.upsert({
          where: { url: input.url },
          create: {
            url: input.url,
            provider: item.merchant,
            brand: item.brand,
            title: item.title,
            image: item.image,
          },
          update: {},
        });

        return {
          ...item,
          type: input.type,
          accessory: input.accessory,
          url: input.url,
        };
      } catch (error) {
        console.log("Fetching item failed: ", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No clothing item found!",
          cause: error,
        });
      }
    }),
});
