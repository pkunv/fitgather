import { AppLogo } from "@/app/_components/header/app-logo";
import { type HeaderIcon } from "@/app/_components/header/header-icon";
import { HeaderMenu } from "@/app/_components/header/header-menu";
import { type buttonVariants } from "@/app/_components/ui/button";
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
  const { isAuthenticated } = getKindeServerSession();
  const isUserAuthenticated = await isAuthenticated();

  const headerLinks: HeaderLink[] = [
    !isUserAuthenticated && {
      title: "Sign in",
      type: "signin",
      button: { variant: "default" },
    },
    !isUserAuthenticated && {
      title: "Sign up",
      type: "signup",
    },
    isUserAuthenticated && {
      title: "My outfits",
      button: { variant: "default" },
      type: "path",
      path: "#",
    },
    isUserAuthenticated && {
      title: "Sign out",
      type: "signout",
    },
  ].filter(Boolean) as HeaderLink[];

  const sheetLinks: HeaderLink[] = [
    !isUserAuthenticated && {
      title: "Sign in",
      type: "signin",
    },
    !isUserAuthenticated && {
      title: "Sign up",
      type: "signup",
    },
    isUserAuthenticated && {
      title: "My outfits",
      type: "path",
      path: "#",
    },
    isUserAuthenticated && {
      title: "Sign out",
      type: "signout",
    },
  ].filter(Boolean) as HeaderLink[];

  return (
    <header className="mx-auto flex w-full max-w-7xl flex-row justify-around gap-6 px-6 py-2 drop-shadow-sm">
      <AppLogo />
      <HeaderMenu headerLinks={headerLinks} sheetLinks={sheetLinks} />
    </header>
  );
}