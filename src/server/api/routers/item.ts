import { env } from "@/env";
import { getItem } from "@/lib/item/get";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { itemSchema, queueSchema } from "@/trpc/schemas";
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
      try {
        const item = await getItem(input.url);
        return await ctx.db.item.create({
          data: {
            type: item.type,
            accessory: item.accessory,
            provider: item.provider,
            url: input.url,
            brand: item.brand,
            title: item.title,
            image: item.image,
            price: item.price,
            currency: item.currency,
            description: item.description,
          },
        });
      } catch (error) {
        console.log("Fetching item failed: ", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No clothing item found!",
          cause: error,
        });
      }
    }),
  add: publicProcedure
    .input(itemSchema.add)
    .mutation(async ({ ctx, input }) => {
      ctx.session?.roles;
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
            message: `Oops! You've made too many requests. Try again at: ${nextAvailableTime.toLocaleTimeString()}`,
          });
        }
      }

      // if any error occurs, it will be catched and a friendly error message will be returned
      try {
        const item = await getItem(input.url);

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
  addToQueue: publicProcedure
    .input(queueSchema.addToQueue)
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const permissions = ctx.session?.permissions;
      const isAdmin = permissions?.permissions.includes("spatula-queue");

      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can add items to the queue.",
        });
      }

      // Make POST request to Spatula queue
      try {
        const response = await fetch(`${env.SPATULA_URL}/queue`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${env.API_KEY}`,
          },
          body: JSON.stringify({ url: input.url }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Spatula API responded with status ${response.status}: ${errorText}`,
          );
        }

        const data = (await response.json()) as { success: boolean };
        return data;
      } catch (error) {
        console.log("Adding to queue failed: ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add item to queue.",
          cause: error,
        });
      }
    }),
});
