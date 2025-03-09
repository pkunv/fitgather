/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { itemSchema } from "@/trpc/schemas";
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
        const response = await fetch(
          `${env.SPATULA_URL}/item?url=${encodeURIComponent(input.url)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Key ${env.SPATULA_API_KEY}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch item from Spatula");
        }

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

        const item = data.item;

        item.title = item.productName ?? "";

        if (item.merchant === null) {
          item.merchant = "unknown";
        }

        if (item.price === null) {
          item.price = 0;
        }

        if (item.brand === null) {
          item.brand = "";
        }

        if (item.currency === null) {
          item.currency = "";
        }

        if (item.title === null) {
          item.title = "";
        }

        item.provider = item.merchant;

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
            item.description = undefined;
          }
        }

        if (data.status === "error") {
          throw new Error("Failed to fetch item! Please try again later.");
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
