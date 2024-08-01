import { z } from "zod";

export const itemSchema = {
  get: z.object({
    type: z.string(),
    accessory: z.boolean(),
    provider: z.string(),
    url: z.string().url(),
    brand: z.string(),
    title: z.string(),
    image: z.string().url(),
    price: z.number(),
    currency: z.string(),
  }),
  create: z.object({
    url: z
      .string({ message: "URL address of clothing item is required." })
      .url({ message: "URL address of clothing item is invalid." }),
    type: z.string(),
    accessory: z.boolean(),
  }),
};

export const outfitSchema = {
  create: z.object({
    head: z.array(itemSchema.get),
    top: z.array(itemSchema.get),
    bottom: z.array(itemSchema.get),
    shoes: z.array(itemSchema.get),
  }),
};
