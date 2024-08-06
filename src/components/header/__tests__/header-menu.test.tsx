import { type HeaderLink } from "@/components/header/_header";
import { HeaderMenu } from "@/components/header/header-menu";
import { render, screen } from "@testing-library/react";
import { expect, test, vitest } from "vitest";

function getHeaderLinks(withAuth: boolean) {
  const headerLinks: HeaderLink[] = [
    !withAuth && {
      title: "Sign in",
      type: "signin",
      button: { variant: "default" },
    },
    !withAuth && {
      title: "Sign up",
      type: "signup",
    },
    withAuth && {
      title: "My outfits",
      button: { variant: "default" },
      type: "path",
      path: "#",
    },
    withAuth && {
      title: "Sign out",
      type: "signout",
    },
  ].filter(Boolean) as HeaderLink[];

  const sheetLinks: HeaderLink[] = [
    !withAuth && {
      title: "Sign in",
      type: "signin",
    },
    !withAuth && {
      title: "Sign up",
      type: "signup",
    },
    withAuth && {
      title: "My outfits",
      type: "path",
      path: "#",
    },
    withAuth && {
      title: "Sign out",
      type: "signout",
    },
  ].filter(Boolean) as HeaderLink[];

  return { header: headerLinks, sheet: sheetLinks };
}

vitest.mock("next/navigation", () => {
  return {
    usePathname: () => "/",
  };
});

test("Unauth menu renders sign up / sign in button", () => {
  const links = getHeaderLinks(false);

  render(<HeaderMenu headerLinks={links.header} sheetLinks={links.sheet} />);
  expect(screen.getByRole("link", { name: "Sign up" })).toBeDefined();
  expect(screen.getByRole("link", { name: "Sign in" })).toBeDefined();
});

test("Auth menu renders sign in sign out button", () => {
  const links = getHeaderLinks(true);

  render(<HeaderMenu headerLinks={links.header} sheetLinks={links.sheet} />);
  expect(screen.getByRole("link", { name: "Sign out" })).toBeDefined();
});

test("");
