import { TypographyH1, TypographyMuted } from "@/components/ui/typography";
import { type RouterOutputs } from "@/trpc/react";
import Image from "next/image";

export function OutfitSummary({
  data,
}: {
  data: Exclude<RouterOutputs["outfit"]["get"], null>;
}) {
  return (
    <>
      <TypographyH1>{data.name}</TypographyH1>
      <div className="flex flex-row gap-2">
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
      </div>
    </>
  );
}
