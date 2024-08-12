import { OutfitCard } from "@/components/outfit/outfit-card";
import { OutfitEmptyList } from "@/components/outfit/outfit-empty-list";
import { api } from "@/trpc/server";

export async function OutfitList({
  type,
  searchQuery,
}: {
  type: "user" | "newest" | "explore";
  searchQuery?: string;
}) {
  const outfits = await api.outfit.getMany({ type, searchQuery });
  return (
    <div className="flex w-full flex-col gap-6">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} data={outfit} />
      ))}
      {outfits.length === 0 && <OutfitEmptyList />}
    </div>
  );
}
