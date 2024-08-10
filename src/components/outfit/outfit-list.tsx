import { OutfitCard } from "@/components/outfit/outfit-card";
import { api } from "@/trpc/server";

export async function OutfitList({
  type,
}: {
  type: "user" | "newest" | "explore";
}) {
  const outfits = await api.outfit.getMany({ type });
  return (
    <div className="flex w-full flex-col gap-6">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} data={outfit} />
      ))}
    </div>
  );
}
