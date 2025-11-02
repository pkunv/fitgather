import { AppLogo } from "@/components/header/app-logo";
import { type HeaderIcon } from "@/components/header/header-icon";
import { HeaderMenu } from "@/components/header/header-menu";
import { type buttonVariants } from "@/components/ui/button";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export type HeaderLink = {
  title: string;
  icon?: HeaderIcon;
  button?: Parameters<typeof buttonVariants>[0];
  type: "signin" | "signup" | "signout" | "userdropdown" | "path";
  path?: string;
};

export async function Header() {
  // We directly use Kinde Auth function instead of tRPC calls
  // to return ctx.session for better response time.
  const { isAuthenticated, getPermissions } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();
  const permissions = await getPermissions();

  const isAdmin = permissions?.permissions.includes("spatula-queue")
    ? true
    : false;

  const headerLinks: HeaderLink[] = [
    isUserAuthenticated && {
      title: "My outfits",
      button: { variant: "default" },
      type: "path",
      path: "/outfits",
      icon: "Shirt",
    },
    {
      title: "Explore",
      type: "path",
      path: "/explore",
      icon: "Telescope",
    },
    !isUserAuthenticated && {
      title: "Sign in",
      type: "signin",
      icon: "LogIn",
    },
    !isUserAuthenticated && {
      title: "Sign up",
      type: "signup",
      button: { variant: "default" },
      icon: "UserRoundPlus",
    },
    isAdmin && {
      title: "Admin panel",
      type: "path",
      path: "/admin-panel",
      icon: "Cog",
    },
    isUserAuthenticated && {
      title: "Sign out",
      type: "signout",
      icon: "LogOut",
    },
  ].filter(Boolean) as HeaderLink[];

  const sheetLinks: HeaderLink[] = [
    isUserAuthenticated && {
      title: "My outfits",
      button: { variant: "default" },
      type: "path",
      path: "/outfits",
      icon: "Shirt",
    },
    {
      title: "Explore",
      type: "path",
      path: "/explore",
      icon: "Telescope",
    },
    !isUserAuthenticated && {
      title: "Sign in",
      type: "signin",
      icon: "LogIn",
    },
    !isUserAuthenticated && {
      title: "Sign up",
      type: "signup",
      button: { variant: "default" },
      icon: "UserRoundPlus",
    },
    isUserAuthenticated && {
      title: "Sign out",
      type: "signout",
      icon: "LogOut",
    },
    isAdmin && {
      title: "Admin panel",
      type: "path",
      path: "/admin",
      icon: "Cog",
    },
  ].filter(Boolean) as HeaderLink[];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-6xl flex-row justify-between gap-6 px-6 py-2 sm:px-0">
        <AppLogo />
        <HeaderMenu headerLinks={headerLinks} sheetLinks={sheetLinks} />
      </div>
    </header>
  );
}
