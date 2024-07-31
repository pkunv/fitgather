import { get } from "@/server/api/procedures/user/get";
import { getSession } from "@/server/api/procedures/user/getSession";
import { signIn } from "@/server/api/procedures/user/signIn";
import { createTRPCRouter } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  signIn,
  getSession,
  get,
});
