import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { generate } from "random-words";

export const userRouter = createTRPCRouter({
  signIn: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.upsert({
      where: {
        id: ctx.session.user.id,
      },
      // we update only email, picutre, and lastSeenAt date as this procedure is called on every signIn
      update: {
        email: ctx.session.user.email,
        picture: ctx.session.user.picture,
        lastSeenAt: new Date(),
      },
      create: {
        id: ctx.session.user.id,
        fullname: ctx.session.user.given_name,
        email: ctx.session.user.email,
        picture: ctx.session.user.picture,
        username:
          `${ctx.session.user.given_name}${generate({ maxLength: 5 }) as string}`.toLocaleLowerCase(),
      },
    });
  }),
  get: publicProcedure.query(({ ctx }) => {
    if (ctx.session === null) return null;
    if (ctx.session.user === null) return null;
    return ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),
});
