import { OutfitForm } from "@/components/outfit/outfit-form";
import { OutfitList } from "@/components/outfit/outfit-list";
import { Spinner } from "@/components/ui/spinner";
import { TypographyH1, TypographyH2 } from "@/components/ui/typography";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Suspense } from "react";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <>
      <TypographyH1>Let&apos;s make an outfit!</TypographyH1>
      <OutfitForm user={user} action="create" />
      <TypographyH2>Newest outfits</TypographyH2>
      <Suspense fallback={<Spinner />}>
        <OutfitList type="newest" />
      </Suspense>
    </>
  );
}
