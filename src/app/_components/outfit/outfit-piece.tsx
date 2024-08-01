"use client";

import { Button } from "@/app/_components/ui/button";
import { cn } from "@/lib/utils";
import { trousers } from "@lucide/lab";
import { Cat, Footprints, Icon, Plus, Shirt } from "lucide-react";
import Image from "next/image";

export function OutfitPiece({
  type,
  active,
  image,
  onClick,
}: {
  type: "head" | "top" | "bottom" | "shoes" | "accessory";
  active?: boolean;
  image?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "flex h-28 w-full items-center justify-center rounded-lg border-2 transition-all",
        active ? "border-primary" : "border-gray-200",
      )}
      variant={"ghost"}
    >
      {image && (
        <Image
          src={image}
          alt={type}
          width={64}
          height={64}
          objectFit="cover"
        />
      )}
      {!image && type === "head" && <Cat size={36} />}
      {!image && type === "top" && <Shirt size={36} />}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment*/}
      {!image && type === "bottom" && <Icon iconNode={trousers} size={36} />}
      {!image && type === "shoes" && <Footprints size={36} />}
      {!image && type === "accessory" && <Plus size={36} />}
    </Button>
  );
}
