/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { env } from "@/env";
import { getItemHTML } from "@/lib/scraping";
import { ai } from "@/server/ai";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { itemSchema } from "@/trpc/schemas";
import { Type } from "@google/genai";
import { TRPCError } from "@trpc/server";
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
        const html = await getItemHTML(input.url);

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
          merchant: string | null;
          brand: string | null;
          productName: string | null;
          price: number | null;
          currency: string | null;
          imageUrl: string | null;
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
          6. Focus on the most immediately noticeable characteristics
          7. Include possible subculture, trend or music genre related to the item

          Examples of expected output format:
          - "black t-shirt, oversized, small logo, imprint, masculine fitting, subculture: hip-hop"
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
          update: {
            provider: item.merchant,
            brand: item.brand,
            title: item.title,
            image: item.image,
          },
        });

        // pretty print item
        console.log(
          "[item.create] Item created: ",
          JSON.stringify(item, null, 2),
        );

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
