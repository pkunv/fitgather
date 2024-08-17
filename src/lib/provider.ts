/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type itemSchema } from "@/trpc/schemas";
import { type Offer, type Product } from "schema-dts";
import type urlMetadata from "url-metadata";
import { type z } from "zod";

export type Provider = {
  name: string;
  fullname: string;
  url: string;
  regions: string[] | null;
  resolve: (
    metadata: urlMetadata.Result,
  ) => z.infer<typeof itemSchema.get> | null;
  useUnoptimizedImage?: boolean;
};

export const providers = [
  {
    name: "zalando",
    fullname: "Zalando",
    url: "https://www.zalando.com",
    regions: ["EU"],
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
    fullname: "Vinted",
    url: "https://www.vinted.com",
    regions: ["US", "EU"],
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
    fullname: "H&M",
    url: "https://www2.hm.com",
    regions: ["US", "EU"],
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
      const brand = product.brand?.toString().toLocaleLowerCase() ?? "unknown";
      const title = product.name?.toString() + " " + product.color?.toString();
      const offer = (product.offers as []).find(
        (entry) => entry["@type"] === "Offer",
      )! as Offer;
      const price = parseInt(offer.price as string);
      const currency = (offer.priceCurrency as string)
        .toString()
        .toLocaleLowerCase();

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
  {
    name: "bershka",
    fullname: "Bershka",
    url: "https://www.bershka.com",
    regions: null,
    resolve: null,
  },
  {
    name: "cropp",
    fullname: "Cropp",
    url: "https://www.cropp.com",
    regions: null,
    resolve: null,
  },
  {
    name: "gucci",
    fullname: "Gucci",
    url: "https://www.gucci.com",
    regions: ["All"],
    resolve: function (metadata: urlMetadata.Result) {
      const product = (metadata.jsonld as []).find(
        (entry) => entry["@type"] === "Product",
      )! as Product;
      const title = product.name?.toString();
      const image = metadata.jsonld[0].image[0] as string; // product.image[0] as string;
      const offer = (product.offers as []).find(
        (entry) => entry["@type"] === "Offer",
      )! as Offer;
      const price = parseInt(offer.price as string);
      const currency = (offer.priceCurrency as string)
        .toString()
        .toLocaleLowerCase();

      return {
        provider: this.name,
        brand: this.fullname,
        title,
        image,
        price,
        currency,
      };
    },
    useUnoptimizedImage: true,
  },
  {
    name: "prada",
    fullname: "Prada",
    url: "https://www.prada.com",
    regions: null,
    resolve: null,
  },
  {
    name: "pullandbear",
    fullname: "Pull&Bear",
    url: "https://www.pullandbear.com",
    regions: null,
    resolve: null,
  },
  {
    name: "stradivarius",
    fullname: "Stradivarius",
    url: "https://www.stradivarius.com",
    regions: null,
    resolve: null,
  },
  {
    name: "zara",
    fullname: "Zara",
    url: "https://www.zara.com",
    regions: null,
    resolve: null,
  },
] as Provider[];

export function isUnoptimizedImage(imageUrl: string): boolean {
  return providers.some(
    (provider) =>
      provider.useUnoptimizedImage && imageUrl.includes(provider.name),
  );
}
