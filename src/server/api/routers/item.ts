/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { resolveItem } from "@/lib/item";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { itemSchema } from "@/trpc/schemas";
import { TRPCError } from "@trpc/server";
import urlMetadata from "url-metadata";

export const itemRouter = createTRPCRouter({
  create: publicProcedure
    .input(itemSchema.create)
    .mutation(async ({ ctx, input }) => {
      // if any error occurs, it will be catched and a friendly error message will be returned
      try {
        const metadata = await urlMetadata(input.url);

        const item = resolveItem(metadata);

        // as a security measure insert a record to db
        // to confirm later (while creating an outfit) that the item URL is valid
        // do nothing if the resolved item with this url is already in the db
        await ctx.db.resolvedItem.upsert({
          where: { url: input.url },
          create: { url: input.url, provider: item.provider },
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
