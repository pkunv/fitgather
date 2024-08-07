/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { itemSchema } from "@/trpc/schemas";
import { TRPCError } from "@trpc/server";
import urlMetadata from "url-metadata";

export const itemRouter = createTRPCRouter({
  create: publicProcedure
    .input(itemSchema.create)
    .mutation(async ({ ctx, input }) => {
      function resolveItem(metadata: urlMetadata.Result) {
        const providers = [
          {
            name: "zalando",
            resolve: function (metadata: urlMetadata.Result) {
              const provider = this.name;
              const brand = (
                metadata.jsonld[0].brand.name as string
              ).toLocaleLowerCase();
              const title = (metadata["og:title"] as string).split(
                " - Zalando",
              )[0]!;
              const image = metadata["og:image"] as string;
              const price = parseInt(
                metadata.jsonld[0].offers[0].price as string,
              );
              const currency = (
                metadata.jsonld[0].offers[0].priceCurrency as string
              ).toLocaleLowerCase();

              return { provider, brand, title, image, price, currency };
            },
          },
          {
            name: "vinted",
            resolve: function (metadata: urlMetadata.Result) {
              const provider = this.name;
              const brand = (
                metadata["og:brand"] as string
              ).toLocaleLowerCase();
              const title = metadata["og:title"] as string;
              const image = metadata["og:image"] as string;
              const price = parseInt(metadata["og:price:amount"] as string);
              const currency = (
                metadata["og:price:currency"] as string
              ).toLocaleLowerCase();

              return { provider, brand, title, image, price, currency };
            },
          },
        ];

        const provider = providers.find((provider) =>
          (metadata.requestUrl as string).includes(provider.name),
        );
        if (!provider)
          throw new Error("No provider found for this item!", {
            cause: "No provider found for this item!",
          });

        return provider.resolve(metadata);
      }

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
