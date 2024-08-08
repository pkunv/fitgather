import { OutfitCard } from "@/components/outfit/outfit-card";
import { api } from "@/trpc/server";

export async function OutfitList() {
  const outfits = await api.outfit.getByUser();
  return (
    <div className="flex w-full flex-col gap-6">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} data={outfit} />
      ))}
    </div>
  );
}
