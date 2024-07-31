import { AppLogo } from "@/app/_components/app-logo";
import { buttonVariants } from "@/app/_components/ui/button";
import { TypographyLead } from "@/app/_components/ui/typography";
import { cn } from "@/lib/utils";
import { api, HydrateClient } from "@/trpc/server";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import Image from "next/image";

export default async function Home() {
  const user = await api.user.get();
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6">
        <AppLogo />
        {user === null && (
          <>
            <LoginLink className={cn(buttonVariants({ variant: "ghost" }))}>
              Sign in
            </LoginLink>
            <RegisterLink className={cn(buttonVariants({ variant: "ghost" }))}>
              Sign up
            </RegisterLink>
          </>
        )}
        {user !== null && (
          <>
            <TypographyLead>
              Welcome {user.fullname}. Your username: {user.username}
            </TypographyLead>
            <Image
              src={user.picture ?? "/user.svg"}
              alt={`${user.fullname} profile picture`}
              width={24}
              height={24}
              className="rounded-full"
            />
            <LogoutLink className={cn(buttonVariants({ variant: "ghost" }))}>
              Sign out
            </LogoutLink>
          </>
        )}
      </main>
    </HydrateClient>
  );
}
