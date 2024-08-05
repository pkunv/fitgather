/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { itemSchema } from "@/trpc/schemas";
import { TRPCError } from "@trpc/server";
import urlMetadata from "url-metadata";

export const itemRouter = createTRPCRouter({
  create: publicProcedure
    .input(itemSchema.create)
    .mutation(async ({ input }) => {
      function resolveItem(metadata: urlMetadata.Result) {
        const providers = [
          {
            name: "zalando",
            resolve: function (metadata: urlMetadata.Result) {
              if (!metadata.jsonld) throw new Error("No JSON-LD found");

              return {
                provider: this.name,
                brand: (
                  metadata.jsonld[0].brand.name as string
                ).toLocaleLowerCase(),
                title: (metadata["og:title"] as string).split(" - Zalando")[0]!,
                image: metadata["og:image"] as string,
                price: parseInt(metadata.jsonld[0].offers[0].price as string),
                currency: (
                  metadata.jsonld[0].offers[0].priceCurrency as string
                ).toLocaleLowerCase(),
              };
            },
          },
          {
            name: "vinted",
            resolve: function (metadata: urlMetadata.Result) {
              return {
                provider: this.name,
                brand: (metadata["og:brand"] as string).toLocaleLowerCase(),
                title: metadata["og:title"] as string,
                image: metadata["og:image"] as string,
                price: parseInt(metadata["og:price:amount"] as string),
                currency: (
                  metadata["og:price:currency"] as string
                ).toLocaleLowerCase(),
              };
            },
          },
        ];

        const provider = providers.find((provider) =>
          (metadata.requestUrl as string).includes(provider.name),
        );
        if (!provider) return null;

        return provider.resolve(metadata);
      }

      const metadata = await urlMetadata(input.url);

      const item = resolveItem(metadata);
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        ...item,
        type: input.type,
        accessory: input.accessory,
        url: input.url,
      };
    }),
});
