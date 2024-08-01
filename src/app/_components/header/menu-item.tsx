"use client";

import { type HeaderLink } from "@/app/_components/header/_header";
import { HeaderIcon } from "@/app/_components/header/header-icon";
import { buttonVariants } from "@/app/_components/ui/button";
import { cn } from "@/lib/utils";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MenuItem({ item }: { item: HeaderLink }) {
  const pathname = usePathname();
  const [active, setActive] = useState(
    `/${pathname.slice(1).split("/")[0]}` === item.path,
  );

  useEffect(() => {
    setActive(`/${pathname.slice(1).split("/")[0]}` === item.path);
  }, [pathname, item.path]);

  return (
    <>
      {item.type === "path" && (
        <Link
          href={item.path!}
          className={cn(
            buttonVariants(item.button ?? { variant: "ghost" }),
            "ml-4 w-fit items-center justify-stretch gap-4",
            active ? "bg-accent text-accent-foreground" : "",
          )}
        >
          {item.icon && (
            <HeaderIcon icon={item.icon} strokeWidth={active ? 2.5 : 2} />
          )}
          {item.title}
        </Link>
      )}
      {item.type === "signin" && (
        <LoginLink
          className={cn(
            buttonVariants(item.button ?? { variant: "ghost" }),
            "ml-4 w-fit items-center justify-stretch gap-4",
            active ? "bg-accent text-accent-foreground" : "",
          )}
        >
          {item.icon && (
            <HeaderIcon icon={item.icon} strokeWidth={active ? 2.5 : 2} />
          )}
          {item.title}
        </LoginLink>
      )}
      {item.type === "signup" && (
        <RegisterLink
          className={cn(
            buttonVariants(item.button ?? { variant: "ghost" }),
            "ml-4 w-fit items-center justify-stretch gap-4",
            active ? "bg-accent text-accent-foreground" : "",
          )}
        >
          {item.icon && (
            <HeaderIcon icon={item.icon} strokeWidth={active ? 2.5 : 2} />
          )}
          {item.title}
        </RegisterLink>
      )}
      {item.type === "signout" && (
        <LogoutLink
          className={cn(
            buttonVariants(item.button ?? { variant: "ghost" }),
            "ml-4 w-fit items-center justify-stretch gap-4",
            active ? "bg-accent text-accent-foreground" : "",
          )}
        >
          {item.icon && (
            <HeaderIcon icon={item.icon} strokeWidth={active ? 2.5 : 2} />
          )}
          {item.title}
        </LogoutLink>
      )}
    </>
  );
}
