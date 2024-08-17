import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getOutfitItems } from "@/lib/item";
import { isUnoptimizedImage } from "@/lib/provider";
import { type RouterOutputs } from "@/trpc/react";
import Image from "next/image";
import Link from "next/link";

export function OutfitCard({
  data,
}: {
  data: Exclude<RouterOutputs["outfit"]["get"], null>;
}) {
  return (
    <Link href={`/outfits/${data.code}`}>
      <Card className="w-full hover:bg-accent">
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
          <CardDescription className="flex gap-2">
            by{" "}
            <Image
              width={23}
              height={23}
              className="rounded-full"
              src={data.user.picture ?? "/user.svg"}
              alt={data.user.fullname + " profile picture"}
            />{" "}
            {data.user.fullname} • {data.createdAt.toLocaleDateString()}
            {data.likes.length > 0 && ` • ${data.likes.length} likes`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-row gap-2">
          {getOutfitItems(data.outfit).map((item, index) => (
            <Image
              key={index}
              src={item.image}
              alt={item.title}
              width={54}
              height={54}
              unoptimized={isUnoptimizedImage(item.image)}
            />
          ))}
        </CardContent>
      </Card>
    </Link>
  );
}
