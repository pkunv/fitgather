import { z } from "zod";

export const itemSchema = {
  get: z.object({
    type: z.enum(["head", "top", "bottom", "shoes"]),
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
    type: z.enum(["head", "top", "bottom", "shoes"]),
    accessory: z.boolean(),
  }),
};

export const outfitSchema = {
  create: z.object(
    {
      head: z.object({
        main: itemSchema.get.nullable(),
        accessories: z.array(itemSchema.get).nullable(),
      }),
      top: z.object({
        main: itemSchema.get.nullable(),
        accessories: z.array(itemSchema.get).nullable(),
      }),
      bottom: z.object({
        main: itemSchema.get.nullable(),
        accessories: z.array(itemSchema.get).nullable(),
      }),
      shoes: z.object({
        main: itemSchema.get.nullable(),
        accessories: z.array(itemSchema.get).nullable(),
      }),
    },
    { message: "You need to add at least one item to your outfit." },
  ),
  select: z
    .object({
      type: z.enum(["head", "top", "bottom", "shoes"]),
      accessory: z.boolean(),
    })
    .nullable(),
};
