import { protectedProcedure } from "@/server/api/trpc";
import { generate } from "random-words";

export const signIn = protectedProcedure.query(({ ctx }) => {
  return ctx.db.user.upsert({
    where: {
      id: ctx.session.user.id,
      // prevent unnecessary updates
      OR: [
        {
          lastSeenAt: {
            lte: new Date(new Date().getTime() - 1000 * 60 * 60 * 1),
          },
        },
        {
          lastSeenAt: null,
        },
      ],
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
});
