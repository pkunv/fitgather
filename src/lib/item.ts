/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { env } from "@/env";
import { type itemSchema, type outfitSchema } from "@/trpc/schemas";
import { type Dispatch, type SetStateAction } from "react";
import type { Offer, Product } from "schema-dts";
import type urlMetadata from "url-metadata";
import { type z } from "zod";

export function getOutfitItems(outfit: z.infer<typeof outfitSchema.create>) {
  return [
    outfit.head.main,
    outfit.top.main,
    outfit.bottom.main,
    outfit.shoes.main,
    ...((outfit.head.accessories as [] | null) ?? []),
    ...((outfit.top.accessories as [] | null) ?? []),
    ...((outfit.bottom.accessories as [] | null) ?? []),
    ...((outfit.shoes.accessories as [] | null) ?? []),
  ].filter((item) => item !== null);
}

export function getOutfitFromItems(items: z.infer<typeof itemSchema.get>[]) {
  const outfit = {
    head: { main: null, accessories: null },
    top: { main: null, accessories: null },
    bottom: { main: null, accessories: null },
    shoes: { main: null, accessories: null },
  } as z.infer<typeof outfitSchema.create>;

  items.forEach((item) => {
    if (item.accessory) {
      outfit[item.type].accessories = outfit.head.accessories
        ? [...(outfit.head.accessories as []), item]
        : [item];
    }
    outfit[item.type].main = item;
  });
  return outfit;
}

export function addItem({
  setState,
  item,
}: {
  setState: Dispatch<SetStateAction<z.infer<typeof outfitSchema.create>>>;
  item: z.infer<typeof itemSchema.get>;
}) {
  if (!item) return;
  setState((prev) => {
    const newState = {
      ...prev,
      [item.type]: item.accessory
        ? {
            main: prev[item.type].main,
            accessories: prev[item.type].accessories
              ? [...(prev[item.type].accessories as []), item]
              : [item],
          }
        : { accessories: prev[item.type].accessories, main: item },
    };
    window.localStorage.setItem("outfit", JSON.stringify(newState));
    return newState;
  });
}

export function deleteItem({
  setState,
  item,
}: {
  setState: Dispatch<SetStateAction<z.infer<typeof outfitSchema.create>>>;
  item: z.infer<typeof itemSchema.get>;
}) {
  if (!item) return;
  setState((prev) => {
    const newState = {
      ...prev,
      [item.type]: item.accessory
        ? {
            main: prev[item.type].main,
            accessories: prev[item.type].accessories
              ? (prev[item.type].accessories as [] | null)?.filter(
                  (acc) => acc !== item,
                )
              : null,
          }
        : { accessories: prev[item.type].accessories, main: null },
    };
    window.localStorage.setItem("outfit", JSON.stringify(newState));
    return newState;
  });
}

export function resolveItem(metadata: urlMetadata.Result) {
  if (env.NODE_ENV === "development") {
    console.dir(metadata, { depth: null });
  }
  const providers = [
    {
      name: "zalando",
      resolve: function (metadata: urlMetadata.Result) {
        const provider = this.name;
        const brand = (
          metadata.jsonld[0].brand.name as string
        ).toLocaleLowerCase();
        const title = (metadata["og:title"] as string).split(" - Zalando")[0]!;
        // get without search params to get full size image
        const image = (metadata["og:image"] as string).split("?")[0];
        if (!image) throw new Error("Couldn't find proper image URL.");
        const price = parseInt(metadata.jsonld[0].offers[0].price as string);
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
        const brand = metadata["og:brand"]
          ? (metadata["og:brand"] as string).toLocaleLowerCase()
          : "unknown";
        const title = metadata["og:title"] as string;
        const image = metadata["og:image"] as string;
        const price = parseInt(metadata["og:price:amount"] as string);
        const currency = (
          metadata["og:price:currency"] as string
        ).toLocaleLowerCase();

        return { provider, brand, title, image, price, currency };
      },
    },
    {
      name: "hm",
      resolve: function (metadata: urlMetadata.Result) {
        const product = (metadata.jsonld as []).find(
          (entry) => entry["@type"] === "Product",
        )! as Product;
        const imageURL = (product.image as string).includes("https://")
          ? product.image
          : "https:" + (product.image as string);
        const image = new URL(imageURL as string);
        if (image.searchParams.has("call")) {
          const callSearchParam = image.searchParams.get("call");
          if (callSearchParam)
            image.searchParams.set("call", encodeURIComponent(callSearchParam));
        }
        const provider = this.name;
        const brand =
          product.brand?.toString().toLocaleLowerCase() ?? "unknown";
        const title =
          product.name?.toString() + " " + product.color?.toString();
        const offer = (product.offers as []).find(
          (entry) => entry["@type"] === "Offer",
        )! as Offer;
        const price = parseInt(offer.price as string);
        const currency = offer.priceCurrency?.toString().toLocaleLowerCase();

        return {
          provider,
          brand,
          title,
          image: image.toString(),
          price,
          currency,
        };
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
