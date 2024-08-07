import { getOutfitFromItems, getOutfitItems } from "@/lib/item";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type itemSchema, outfitSchema } from "@/trpc/schemas";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

function convertToSlug(id: number, content: string) {
  return `${id}-${content
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")}`;
}

export const outfitRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.number().optional(), slug: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const outfit = await ctx.db.outfit.findUnique({
        where: { id: input.id, slug: input.slug },
        include: {
          user: true,
          items: {
            include: {
              item: {
                select: {
                  type: true,
                  accessory: true,
                  provider: true,
                  url: true,
                  title: true,
                  brand: true,
                  price: true,
                  currency: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      if (!outfit) return null;

      return {
        name: outfit.name,
        user: outfit.user,
        outfit: getOutfitFromItems(
          outfit.items.map(
            (item) => item.item as z.infer<typeof itemSchema.get>,
          ),
        ),
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().max(24).nullable(),
        outfit: outfitSchema.create,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const items = getOutfitItems(input.outfit);
      if (items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You need to add at least one item to your outfit.",
        });
      }

      const previousOutfit = (await ctx.db.outfit.findFirst({
        select: {
          id: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })) ?? { id: 0 };

      input.name = input.name ?? `Untitled outfit`;

      const nextId = previousOutfit.id + 1;

      const slug = convertToSlug(
        nextId,
        input.name.split(" ").slice(0, 3).join(" "),
      );

      return await ctx.db.outfit.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          slug,
          items: {
            create: items.map((item) => ({
              item: {
                connectOrCreate: {
                  where: {
                    url: item.url,
                  },
                  create: {
                    ...item,
                    userId: ctx.session.user.id,
                  },
                },
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      });
    }),
});
