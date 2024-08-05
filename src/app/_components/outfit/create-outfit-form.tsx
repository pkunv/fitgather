"use client";

import { CreateItemForm } from "@/app/_components/item/create-item-form";
import { OutfitPiece } from "@/app/_components/outfit/outfit-piece";
import { Separator } from "@/app/_components/ui/separator";
import { type itemSchema, outfitSchema } from "@/trpc/schemas";
import { type Dispatch, type SetStateAction, useState } from "react";
import { type z } from "zod";

const formSchema = outfitSchema.create;

export function CreateOutfitForm() {
  const [outfit, setOutfit] = useState<z.infer<typeof formSchema>>({
    head: {
      main: null,
      accessories: null,
    },
    top: {
      main: null,
      accessories: null,
    },
    bottom: {
      main: null,
      accessories: null,
    },
    shoes: {
      main: null,
      accessories: null,
    },
  });
  const [selectedPiece, setSelectedPiece] =
    useState<z.infer<typeof outfitSchema.select>>(null);

  function addToOutfit({
    setState,
    item,
  }: {
    setState: Dispatch<SetStateAction<z.infer<typeof outfitSchema.create>>>;
    item: z.infer<typeof itemSchema.get>;
  }) {
    if (!item) return;
    setState((prev) => {
      return {
        ...prev,
        [item.type]: item.accessory
          ? {
              main: prev[item.type].main,
              accessories: prev[item.type].accessories
                ? [...(prev[item.type].accessories as []), item]
                : [item],
            }
          : { accessories: prev[item.type].accessories, main: item },
      };
    });
  }

  return (
    <>
      <div className="grid grid-cols-5 grid-rows-1 gap-4">
        <div className="col-span-full grid w-full grid-cols-3 grid-rows-4 gap-4 sm:col-span-3">
          <div className="col-start-2 row-start-1">
            <OutfitPiece
              type="head"
              image={outfit.head.main?.image}
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
              image={outfit.top.main?.image}
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
              image={outfit.bottom.main?.image}
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
              image={outfit.shoes.main?.image}
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
              image={
                outfit.top.accessories !== null &&
                outfit.top.accessories.length > 0
                  ? outfit.top.accessories[0]!.image
                  : undefined
              }
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
              image={
                outfit.head.accessories !== null &&
                outfit.head.accessories.length > 0
                  ? outfit.head.accessories[0]!.image
                  : undefined
              }
              onClick={() => {
                setSelectedPiece({ type: "head", accessory: true });
              }}
            />
          </div>
        </div>
        <div className="col-span-full flex flex-row gap-6 sm:col-span-2">
          <Separator orientation="vertical" />
          <div className="col-span-full flex flex-col gap-6 sm:col-span-2">
            <div className="flex flex-row gap-6">
              <CreateItemForm
                selectedPiece={selectedPiece}
                callback={(data) => {
                  if (!selectedPiece) return;
                  addToOutfit({ setState: setOutfit, item: data });
                }}
              />
            </div>
            <Separator orientation="horizontal" />
          </div>
        </div>
      </div>
    </>
  );
}
