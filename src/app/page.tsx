import { AppLogo } from "@/app/_components/app-logo";
import { Button } from "@/app/_components/ui/button";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6">
        <AppLogo />
        <Button>Button</Button>
      </main>
    </HydrateClient>
  );
}
