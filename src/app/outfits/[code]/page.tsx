import { Outfit } from "@/components/outfit/outfit";
import { OutfitForm } from "@/components/outfit/outfit-form";
import { OutfitSummary } from "@/components/outfit/outfit-summary";
import { OutfitSummaryTable } from "@/components/outfit/outfit-summary-table";
import { getOutfitItems } from "@/lib/utils";
import { api } from "@/trpc/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Separator } from "@radix-ui/react-separator";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code;
  const outfit = await api.outfit.get({ code });
  if (!outfit) return null;

  const title = outfit.name;
  const description = `Outfit created by @${outfit.user.fullname} Join fitgather to create or share outfits using your favourite clothing shops.`;

  return {
    title,
    description,
    openGraph: {
      title: outfit.name,
      description,
      type: "article",
      publishedTime: outfit.createdAt,
      authors: [outfit.user.username],
    },
  } as Metadata;
}

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
      <OutfitSummary data={data} user={user} />
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
