import { getOutfitFromItems, getOutfitItems } from "@/lib/item";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type itemSchema, outfitSchema } from "@/trpc/schemas";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const outfitInclude = {
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
};

export const outfitRouter = createTRPCRouter({
  getMany: publicProcedure
    .input(
      z.object({
        type: z.enum(["user", "newest", "explore"]).default("explore"),
        searchQuery: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return (
        await ctx.db.outfit.findMany({
          where: {
            userId:
              input.type === "user" && ctx.session?.user
                ? ctx.session.user.id
                : undefined,
            OR: [
              {
                items: {
                  some: {
                    item: {
                      brand: {
                        startsWith: `%${input.searchQuery?.toLocaleLowerCase()}%`,
                      },
                      url: {
                        startsWith: `%${input.searchQuery?.toLocaleLowerCase()}%`,
                      },
                      title: {
                        startsWith: `%${input.searchQuery?.toLocaleLowerCase()}%`,
                      },
                    },
                  },
                },
              },
              {
                items: {
                  some: {
                    item: {
                      brand: {
                        endsWith: `%${input.searchQuery?.toLocaleLowerCase()}%`,
                      },
                      url: {
                        endsWith: `%${input.searchQuery?.toLocaleLowerCase()}%`,
                      },
                      title: {
                        endsWith: `%${input.searchQuery?.toLocaleLowerCase()}%`,
                      },
                    },
                  },
                },
              },
              {
                name: {
                  startsWith: input.searchQuery?.toLocaleLowerCase(),
                  contains: input.searchQuery?.toLocaleLowerCase(),
                },
              },
              {
                user: {
                  fullname: {
                    contains: input.searchQuery?.toLocaleLowerCase(),
                  },
                  username: {
                    contains: input.searchQuery?.toLocaleLowerCase(),
                  },
                },
              },
            ],
          },
          include: outfitInclude,
          orderBy: {
            createdAt: "desc",
          },
          take: input.type === "newest" ? 5 : undefined,
        })
      ).map((outfit) => {
        return {
          id: outfit.id,
          code: outfit.code,
          name: outfit.name,
          user: outfit.user,
          createdAt: outfit.createdAt,
          outfit: getOutfitFromItems(
            outfit.items.map(
              (item) => item.item as z.infer<typeof itemSchema.get>,
            ),
          ),
        };
      });
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
});
