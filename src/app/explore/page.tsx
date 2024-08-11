import { SearchBar } from "@/app/explore/search-bar";
import { OutfitList } from "@/components/outfit/outfit-list";
import { Spinner } from "@/components/ui/spinner";
import { TypographyH1 } from "@/components/ui/typography";
import { Suspense } from "react";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { q: string | undefined };
}) {
  return (
    <>
      <TypographyH1>Explore</TypographyH1>
      <SearchBar />
      <Suspense fallback={<Spinner />}>
        <OutfitList type="explore" searchQuery={searchParams.q} />
      </Suspense>
    </>
  );
}
