import { OutfitLike } from "@/components/outfit/outfit-like";
import { TypographyH1, TypographyMuted } from "@/components/ui/typography";
import { type RouterOutputs } from "@/trpc/react";
import { type KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import Image from "next/image";

export function OutfitSummary({
  data,
  user,
}: {
  data: Exclude<RouterOutputs["outfit"]["get"], null>;
  user: KindeUser | null;
}) {
  return (
    <>
      <TypographyH1>{data.name}</TypographyH1>
      <div className="flex flex-row items-center gap-2">
        <TypographyMuted>by</TypographyMuted>
        <Image
          width={23}
          height={23}
          className="rounded-full"
          src={data.user.picture ?? "/user.svg"}
          alt={data.user.fullname + " profile picture"}
        />{" "}
        <TypographyMuted>{data.user.fullname}</TypographyMuted>
        <TypographyMuted className="font-bold">•</TypographyMuted>
        <TypographyMuted>{data.createdAt.toLocaleDateString()}</TypographyMuted>
        <OutfitLike data={data} user={user} />
      </div>
    </>
  );
}
