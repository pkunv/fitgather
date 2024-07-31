import { publicProcedure } from "@/server/api/trpc";

export const get = publicProcedure.query(({ ctx }) => {
  if (ctx.session === null) return null;
  if (ctx.session.user === null) return null;
  return ctx.db.user.findUnique({
    where: {
      id: ctx.session.user.id,
    },
  });
});
