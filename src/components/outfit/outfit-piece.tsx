"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type itemSchema, type itemTypeSchema } from "@/trpc/schemas";
import { trousers } from "@lucide/lab";
import { Cat, Footprints, Icon, Plus, Shirt, ZoomIn } from "lucide-react";
import Image from "next/image";
import { type z } from "zod";

export function OutfitPiece({
  accessory,
  accessoryIndex,
  type,
  item,
  active,
  onClick,
  onExpandImage,
}: {
  accessory: boolean;
  accessoryIndex?: number;
  type: z.infer<typeof itemTypeSchema>;
  item: z.infer<typeof itemSchema.get> | null;
  active?: boolean;
  onClick?: (item: Exclude<z.infer<typeof itemSchema.select>, null>) => void;
  onExpandImage?: (url: string) => void;
}) {
  const onClickHandler = () => {
    const data = {
      type: item?.type ?? type,
      accessory: accessory,
      url: item?.url ?? null,
      accessoryIndex: accessoryIndex ?? undefined,
    };
    onClick && onClick(data);
  };
  return (
    <div
      onClick={onClickHandler}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "relative flex h-28 w-3/4 items-center justify-center rounded-lg border-2 transition-all hover:cursor-pointer",
        active ? "border-primary" : "border-gray-200",
        accessory && !item && !active && "opacity-50 hover:opacity-100",
      )}
      aria-label={`${type} clothing item${accessory ? " accessory" : ""} button`}
    >
      {item && (
        <Button
          variant={"outline"}
          size={"icon"}
          className="absolute left-0 top-0 m-2 opacity-50 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onExpandImage && onExpandImage(item.image);
          }}
        >
          <ZoomIn />
        </Button>
      )}

      {item && (
        <Image
          src={item.image}
          alt={
            item.type +
            " clothing item" +
            (accessory ? " accessory" : "") +
            " image"
          }
          width={64}
          height={64}
          objectFit="cover"
        />
      )}
      {!item && type === "head" && <Cat size={36} />}
      {!item && type === "top" && <Shirt size={36} />}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment*/}
      {!item && type === "bottom" && <Icon iconNode={trousers} size={36} />}
      {!item && type === "shoes" && <Footprints size={36} />}
      {!item && accessory && <Plus size={12} />}
    </div>
  );
}
