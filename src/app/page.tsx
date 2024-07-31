import { Button } from "@/app/_components/ui/button";
import { TypographyH1 } from "@/app/_components/ui/typography";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center gap-6">
        <TypographyH1>Welcome to fitgather</TypographyH1>
        <Button>Button</Button>
      </main>
    </HydrateClient>
  );
}
