import { z } from "zod";

export const itemTypeSchema = z.enum(["head", "top", "bottom", "shoes"], {
  message: "Type of clothing item is required.",
});

export const itemSchema = {
  get: z.object({
    type: itemTypeSchema,
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
    type: itemTypeSchema,
    accessory: z.boolean(),
  }),
  select: z
    .object({
      url: z.string().url().nullable(),
      type: itemTypeSchema,
      accessory: z.boolean(),
      accessoryIndex: z.number().optional(),
    })
    .nullable(),
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
};
