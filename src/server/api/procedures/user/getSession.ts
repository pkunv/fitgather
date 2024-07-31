import { publicProcedure } from "@/server/api/trpc";

export const getSession = publicProcedure.query(({ ctx }) => {
  return ctx.session;
});
