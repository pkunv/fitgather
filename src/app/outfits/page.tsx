import { OutfitList } from "@/components/outfit/outfit-list";
import { Spinner } from "@/components/ui/spinner";
import { TypographyH1 } from "@/components/ui/typography";
import { Suspense } from "react";

export default async function UserOutfitsPage() {
  return (
    <>
      <TypographyH1>My outfits</TypographyH1>
      <Suspense fallback={<Spinner />}>
        <OutfitList />
      </Suspense>
    </>
  );
}
