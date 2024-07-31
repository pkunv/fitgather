import { getLinks } from "@/server/api/procedures/layout/getLinks";
import { createTRPCRouter } from "@/server/api/trpc";

export const layoutRouter = createTRPCRouter({ getLinks });
