import { Outfit } from "@/components/outfit/outfit";
import { OutfitForm } from "@/components/outfit/outfit-form";
import { OutfitSummary } from "@/components/outfit/outfit-summary";
import { OutfitSummaryTable } from "@/components/outfit/outfit-summary-table";
import { TypographyH1, TypographyMuted } from "@/components/ui/typography";
import { getOutfitItems } from "@/lib/item";
import { api } from "@/trpc/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Separator } from "@radix-ui/react-separator";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function OutfitPage({
  params,
}: {
  params: { code: string };
}) {
  const data = await api.outfit.get({ code: params.code });
  if (!data) notFound();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (user?.id === data.user.id) {
    return <OutfitForm user={user} action="update" data={data} />;
  }

  return (
    <>
      <OutfitSummary data={data} />
      <div className="grid grid-cols-5 grid-rows-1 gap-4">
        <Outfit outfit={data.outfit} />
        <div className="col-span-full flex flex-row gap-6 sm:col-span-2">
          <Separator orientation="vertical" className="hidden sm:block" />
          <div className="col-span-full flex flex-col gap-6 sm:col-span-2">
            <Separator orientation="horizontal" />
            <div className="flex min-h-96 flex-col gap-6">
              <OutfitSummaryTable items={getOutfitItems(data.outfit)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
