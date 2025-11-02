"use client";

import { Card, CardContent } from "@/components/ui/card";
import { type RouterOutputs } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function ItemCard({
  item,
  onClick,
}: {
  item: RouterOutputs["item"]["getMany"][0];
  onClick: () => void;
}) {
  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-primary"
      onClick={onClick}
    >
      <CardContent className="flex gap-6 p-6">
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-md bg-muted">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start gap-2">
            <h3 className="line-clamp-2 flex-1 text-lg font-semibold">
              {item.title}
            </h3>
            <Link
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Open item in new tab"
            >
              <ExternalLink className="h-5 w-5" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">{item.brand}</p>
          <div className="mt-auto flex items-center justify-between gap-4">
            <p className="text-lg font-bold">
              {item.price} {item.currency}
            </p>
            <p className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(new Date(item.updatedAt))} ago
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

