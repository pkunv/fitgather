import { links } from "@/lib/links";
import { publicProcedure } from "@/server/api/trpc";

export const getLinks = publicProcedure.query(async ({ ctx }) => {
  const isAuthenticated = ctx.session !== null;

  return {
    header: links.filter(
      (link) =>
        link.includeIn.header &&
        (link.onAuth === undefined ||
          (isAuthenticated && link.onAuth === "show") ||
          (!isAuthenticated && link.onAuth === "hide")),
    ),
    footer: links.filter(
      (link) =>
        link.includeIn.footer && (isAuthenticated || link.onAuth === "hide"),
    ),
    userDropdown: links.filter(
      (link) =>
        link.includeIn.userDropdown &&
        (isAuthenticated || link.onAuth === "hide"),
    ),
    sheet: links.filter(
      (link) =>
        link.includeIn.sheet && (isAuthenticated || link.onAuth === "hide"),
    ),
  };
});
