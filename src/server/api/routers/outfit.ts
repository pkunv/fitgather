import { getOutfitFromItems, getOutfitItems } from "@/lib/utils";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { outfitSchema } from "@/trpc/schemas";
import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const outfitInclude = {
  user: true,
  likes: true,
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
          description: true,
        },
      },
    },
  },
};

type OutfitWithIncludes = Prisma.OutfitGetPayload<{
  include: typeof outfitInclude;
}>;

export const outfitRouter = createTRPCRouter({
  getMany: publicProcedure
    .input(
      z.object({
        type: z.enum(["user", "newest", "explore"]).default("explore"),
        searchQuery: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const searchQuery = input.searchQuery?.toLowerCase();
      const results = await ctx.db.outfit.findMany({
        where: {
          userId:
            input.type === "user" && ctx.session?.user
              ? ctx.session.user.id
              : undefined,
          ...(searchQuery
            ? {
                OR: [
                  {
                    items: {
                      some: {
                        item: {
                          OR: [
                            { description: { contains: searchQuery } },
                            { brand: { contains: searchQuery } },
                            { title: { contains: searchQuery } },
                          ],
                        },
                      },
                    },
                  },
                  { name: { contains: searchQuery } },
                  {
                    user: {
                      OR: [
                        { fullname: { contains: searchQuery } },
                        { username: { contains: searchQuery } },
                      ],
                    },
                  },
                ],
              }
            : {}),
        },
        include: outfitInclude,
        orderBy: { createdAt: "desc" },
        take: input.type === "newest" ? 5 : undefined,
      });

      return results.map((outfit: OutfitWithIncludes) => ({
        id: outfit.id,
        code: outfit.code,
        name: outfit.name,
        user: outfit.user,
        createdAt: outfit.createdAt,
        likes: outfit.likes,
        outfit: getOutfitFromItems(
          outfit.items.map((item) => ({
            ...item.item,
            type: item.item.type as "head" | "top" | "bottom" | "shoes",
            accessory: Boolean(item.item.accessory),
            description: item.item.description ?? undefined,
          })),
        ),
      }));
    }),
  get: publicProcedure
    .input(z.object({ id: z.number().optional(), code: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const outfit = await ctx.db.outfit.findUnique({
        where: { id: input.id, code: input.code?.toLocaleUpperCase() },
        include: outfitInclude,
      });
      if (!outfit) return null;

      return {
        id: outfit.id,
        code: outfit.code,
        name: outfit.name,
        user: outfit.user,
        createdAt: outfit.createdAt,
        likes: outfit.likes,
        outfit: getOutfitFromItems(
          outfit.items.map((item) => ({
            ...item.item,
            type: item.item.type as "head" | "top" | "bottom" | "shoes",
            accessory: Boolean(item.item.accessory),
            description: item.item.description ?? undefined,
          })),
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
      if (
        (input.outfit.head?.accessories?.length ?? 0) > 2 ||
        (input.outfit.top?.accessories?.length ?? 0) > 2 ||
        (input.outfit.bottom?.accessories?.length ?? 0) > 2 ||
        (input.outfit.shoes?.accessories?.length ?? 0) > 2
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't add more than 2 accessories to a type.",
        });
      }

      const items = getOutfitItems(input.outfit);

      if (items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You need to add at least one item to your outfit.",
        });
      }

      // Verify items against ResolvedItem records
      for (const item of items) {
        const resolvedItem = await ctx.db.resolvedItem.findFirst({
          where: { url: item.url },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (!resolvedItem) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "One or more items have not been properly resolved. Please try adding them again.",
          });
        }

        // Check if all properties match what was resolved
        if (
          resolvedItem.provider !== item.provider ||
          resolvedItem.brand !== item.brand ||
          resolvedItem.title !== item.title ||
          resolvedItem.image !== item.image
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Item properties do not match what was previously resolved. Please try adding the item again.",
          });
        }
      }

      // find duplicate items by the same url property
      const duplicateItems = items.filter(
        (item, index, self) =>
          index !== self.findIndex((t) => t.url === item.url),
      );

      if (duplicateItems.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't add the same item more than once.",
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

      const nextId = previousOutfit.id + 1;

      input.name = input.name ?? `Untitled outfit`;

      // This code structure guarantees that the code will be unique
      // and provides easily rememberable codes to share links.
      const code =
        nextId +
        "O" +
        (Math.random() + 1).toString(36).substring(9).toUpperCase();

      return await ctx.db.outfit.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
          code,
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
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
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

      // Verify items against ResolvedItem records
      for (const item of items) {
        const resolvedItem = await ctx.db.resolvedItem.findUnique({
          where: { url: item.url },
        });

        if (!resolvedItem) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "One or more items have not been properly resolved. Please try adding them again.",
          });
        }

        // Check if all properties match what was resolved
        if (
          resolvedItem.provider !== item.provider ||
          resolvedItem.brand !== item.brand ||
          resolvedItem.title !== item.title ||
          resolvedItem.image !== item.image
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Item properties do not match what was previously resolved. Please try adding the item again.",
          });
        }
      }

      const outfit = await ctx.db.outfit.findUnique({
        where: { id: input.id },
        include: outfitInclude,
      });

      if (!outfit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Outfit not found.",
        });
      }

      if (outfit.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this outfit.",
        });
      }

      input.name = input.name ?? `Untitled outfit`;

      await ctx.db.outfitItems.deleteMany({
        where: {
          outfitId: input.id,
        },
      });

      return await ctx.db.outfit.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          userId: ctx.session.user.id,
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
  delete: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const outfit = await ctx.db.outfit.findFirst({
        where: {
          code: input.code,
          userId: ctx.session.user.id,
        },
      });

      if (!outfit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Outfit not found.",
        });
      }

      await ctx.db.outfitItems.deleteMany({
        where: {
          outfitId: outfit.id,
        },
      });

      return await ctx.db.outfit.delete({
        where: {
          id: outfit.id,
        },
      });
    }),
  toggleLike: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const outfit = await ctx.db.outfit.findUnique({
        where: { id: input.id },
        include: {
          likes: true,
        },
      });

      if (!outfit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Outfit not found.",
        });
      }

      const like = outfit.likes.find(
        (like) => like.userId === ctx.session.user.id,
      );

      if (like) {
        await ctx.db.outfitLikes.delete({
          where: {
            id: like.id,
          },
        });
      } else {
        await ctx.db.outfitLikes.create({
          data: {
            userId: ctx.session.user.id,
            outfitId: outfit.id,
          },
        });
      }

      return await ctx.db.outfit.findUnique({
        where: { id: input.id },
        include: {
          likes: true,
        },
      });
    }),
});
