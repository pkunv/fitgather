"use client";

import { CreateItemForm } from "@/app/_components/item/create-item-form";
import { OutfitPiece } from "@/app/_components/outfit/outfit-piece";
import { Separator } from "@/app/_components/ui/separator";
import { outfitSchema } from "@/trpc/schemas";
import { useState } from "react";
import { type z } from "zod";

const formSchema = outfitSchema.create;

export function CreateOutfitForm() {
  const [outfit, setOutfit] = useState<z.infer<typeof formSchema> | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<{
    type: "head" | "top" | "bottom" | "shoes";
    accessory: boolean;
  } | null>(null);

  return (
    <>
      <div className="grid grid-cols-5 grid-rows-1 gap-4">
        <div className="col-span-full grid w-full grid-cols-3 grid-rows-4 gap-4 sm:col-span-3">
          <div className="col-start-2 row-start-1">
            <OutfitPiece
              type="head"
              image={outfit?.head.find((item) => !item.accessory)?.image}
              active={
                selectedPiece?.type === "head" && !selectedPiece?.accessory
              }
              onClick={() => {
                setSelectedPiece({ type: "head", accessory: false });
              }}
            />
          </div>
          <div className="col-start-2 row-start-2">
            <OutfitPiece
              type="top"
              image={outfit?.top.find((item) => !item.accessory)?.image}
              active={
                selectedPiece?.type === "top" && !selectedPiece?.accessory
              }
              onClick={() => {
                setSelectedPiece({ type: "top", accessory: false });
              }}
            />
          </div>
          <div className="col-start-2 row-start-3">
            <OutfitPiece
              type="bottom"
              image={outfit?.bottom.find((item) => !item.accessory)?.image}
              active={
                selectedPiece?.type === "bottom" && !selectedPiece?.accessory
              }
              onClick={() => {
                setSelectedPiece({ type: "bottom", accessory: false });
              }}
            />
          </div>
          <div className="col-start-2 row-start-4">
            <OutfitPiece
              type="shoes"
              image={outfit?.shoes.find((item) => !item.accessory)?.image}
              active={
                selectedPiece?.type === "shoes" && !selectedPiece?.accessory
              }
              onClick={() => {
                setSelectedPiece({ type: "shoes", accessory: false });
              }}
            />
          </div>
          <div className="col-start-3 row-start-2">
            <OutfitPiece
              type="accessory"
              active={selectedPiece?.accessory && selectedPiece?.type === "top"}
              onClick={() => {
                setSelectedPiece({ type: "top", accessory: true });
              }}
            />
          </div>
          <div className="col-start-3 row-start-1">
            <OutfitPiece
              type="accessory"
              active={
                selectedPiece?.accessory && selectedPiece?.type === "head"
              }
              onClick={() => {
                setSelectedPiece({ type: "head", accessory: true });
              }}
            />
          </div>
        </div>
        <div className="col-span-full flex flex-row gap-6 sm:col-span-2">
          <Separator orientation="vertical" />
          <CreateItemForm
            selectedPiece={selectedPiece}
            callback={(data) => {
              if (!selectedPiece) return;
              // IN PROGRESS: Update outfit state with new item
              setOutfit({ ...outfit, [selectedPiece.type]: data });
            }}
          />
        </div>
      </div>
    </>
  );
}
