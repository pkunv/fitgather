import { type MappedIcon } from "@/app/_components/icon";
import { type buttonVariants } from "@/app/_components/ui/button";

export type Link = {
  title: string;
  onAuth?: "show" | "hide";
  includeIn: {
    header?: boolean;
    footer?: boolean;
    userDropdown?: boolean;
    sheet?: boolean;
  };
  icon?: MappedIcon;
  button?: Parameters<typeof buttonVariants>[0];
  type: "signin" | "signup" | "signout" | "userdropdown" | "path";
  path?: string;
};
/**
 * Links for the whole UI.
 * If you want to add a link with a path, you need to specify link.type property as "path"
 *
 * link.onAuth property is used to show or hide the link based on the user's authentication status.
 * eg. Sign out link (visible only if user is signed in) has link.onAuth property set to "show"
 *
 * You can specify link.button property to automatically style the link as a shadcn/ui button component.
 */
export const links: Link[] = [
  {
    title: "Home",
    icon: "Home",
    type: "path",
    path: "#",
    includeIn: {
      header: false,
      footer: true,
      userDropdown: false,
      sheet: false,
    },
  },
  {
    title: "My outfits",
    type: "path",
    path: "#",
    onAuth: "show",
    includeIn: {
      header: true,
      footer: true,
      userDropdown: false,
      sheet: true,
    },
    button: {
      variant: "default",
    },
  },
  {
    title: "Sign up",
    type: "signup",
    icon: "UserRoundPlus",
    onAuth: "hide",
    includeIn: {
      header: true,
      footer: true,
      userDropdown: false,
      sheet: true,
    },
  },
  {
    title: "Sign in",
    type: "signin",
    icon: "LogIn",
    onAuth: "hide",
    includeIn: {
      header: true,
      footer: true,
      userDropdown: false,
      sheet: true,
    },
    button: {
      variant: "default",
    },
  },
  {
    title: "Sign out",
    type: "signout",
    onAuth: "show",
    includeIn: {
      header: true,
      footer: false,
      userDropdown: true,
      sheet: true,
    },
  },
  {
    title: "Profile",
    type: "userdropdown",
    onAuth: "hide",
    includeIn: {
      header: true,
      footer: false,
      userDropdown: false,
      sheet: false,
    },
  },
];
