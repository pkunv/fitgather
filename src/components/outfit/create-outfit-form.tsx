"use client";

import { ItemForm } from "@/components/item/item-form";
import { OutfitPiece } from "@/components/outfit/outfit-piece";
import { OutfitSummaryTable } from "@/components/outfit/outfit-summary-table";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { type itemSchema, outfitSchema } from "@/trpc/schemas";
import Image from "next/image";
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
    useState<z.infer<typeof itemSchema.select>>(null);
  const [expandImage, setExpandImage] = useState<string | false>(false);

  function getOutfitItems(outfit: z.infer<typeof outfitSchema.create>) {
    return [
      outfit.head.main,
      outfit.top.main,
      outfit.bottom.main,
      outfit.shoes.main,
      ...((outfit.head.accessories as [] | null) ?? []),
      ...((outfit.top.accessories as [] | null) ?? []),
      ...((outfit.bottom.accessories as [] | null) ?? []),
      ...((outfit.shoes.accessories as [] | null) ?? []),
    ].filter((item) => item !== null);
  }

  function addItem({
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

  function deleteItem({
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
                ? (prev[item.type].accessories as [] | null)?.filter(
                    (acc) => acc !== item,
                  )
                : null,
            }
          : { accessories: prev[item.type].accessories, main: null },
      };
    });
  }

  return (
    <>
      <Dialog
        open={expandImage !== false}
        onOpenChange={() => {
          setExpandImage(false);
        }}
      >
        <DialogContent className="min-h-96">
          <DialogHeader>
            <Image
              src={expandImage as string}
              width={540}
              height={540}
              alt="Expanded image"
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-5 grid-rows-1 gap-4">
        <div className="col-span-full grid h-fit w-full grid-cols-3 grid-rows-4 gap-4 justify-self-end bg-background sm:col-span-3">
          {/* MAIN ITEMS TOP TO BOTTOM */}
          <div className="col-start-2 row-start-1">
            <OutfitPiece
              type="head"
              accessory={false}
              item={outfit.head.main}
              active={
                selectedPiece?.type === "head" && !selectedPiece?.accessory
              }
              onClick={setSelectedPiece}
              onExpandImage={(url) => setExpandImage(url)}
            />
          </div>
          <div className="col-start-2 row-start-2">
            <OutfitPiece
              type="top"
              accessory={false}
              item={outfit.top.main}
              active={
                selectedPiece?.type === "top" && !selectedPiece?.accessory
              }
              onClick={setSelectedPiece}
              onExpandImage={(url) => setExpandImage(url)}
            />
          </div>
          <div className="col-start-2 row-start-3">
            <OutfitPiece
              type="bottom"
              item={outfit.bottom.main}
              accessory={false}
              active={
                selectedPiece?.type === "bottom" && !selectedPiece?.accessory
              }
              onClick={setSelectedPiece}
              onExpandImage={(url) => setExpandImage(url)}
            />
          </div>
          <div className="col-start-2 row-start-4">
            <OutfitPiece
              type="shoes"
              accessory={false}
              item={outfit.shoes.main}
              active={
                selectedPiece?.type === "shoes" && !selectedPiece?.accessory
              }
              onClick={setSelectedPiece}
              onExpandImage={(url) => setExpandImage(url)}
            />
          </div>
          {/* ACCESSORIES HEAD LEFT TO RIGHT */}
          <div className="col-start-1 row-start-1">
            <OutfitPiece
              type="head"
              accessory={true}
              accessoryIndex={0}
              active={
                selectedPiece?.accessory &&
                selectedPiece?.type === "head" &&
                selectedPiece.accessoryIndex === 1
              }
              item={
                outfit.head.accessories?.[0] ? outfit.head.accessories[0] : null
              }
              onClick={setSelectedPiece}
              onExpandImage={(url) => setExpandImage(url)}
            />
          </div>
          <div className="col-start-3 row-start-1">
            <OutfitPiece
              type="head"
              accessory={true}
              accessoryIndex={1}
              active={
                selectedPiece?.accessory &&
                selectedPiece?.type === "head" &&
                selectedPiece.accessoryIndex === 1
              }
              item={
                outfit.head.accessories?.[1] ? outfit.head.accessories[1] : null
              }
              onClick={setSelectedPiece}
              onExpandImage={(url) => setExpandImage(url)}
            />
          </div>
          {/* ACCESSORIES TOP LEFT TO RIGHT */}
          <div className="col-start-1 row-start-2">
            <OutfitPiece
              type="top"
              accessory={true}
              accessoryIndex={0}
              active={
                selectedPiece?.accessory &&
                selectedPiece?.type === "top" &&
                selectedPiece.accessoryIndex === 0
              }
              item={
                outfit.top.accessories?.[0] ? outfit.top.accessories[0] : null
              }
              onClick={setSelectedPiece}
              onExpandImage={(url) => setExpandImage(url)}
            />
          </div>
          <div className="col-start-3 row-start-2">
            <OutfitPiece
              type="top"
              accessory={true}
              accessoryIndex={1}
              active={
                selectedPiece?.accessory &&
                selectedPiece?.type === "top" &&
                selectedPiece.accessoryIndex === 1
              }
              item={
                outfit.top.accessories?.[1] ? outfit.top.accessories[1] : null
              }
              onClick={setSelectedPiece}
              onExpandImage={(url) => setExpandImage(url)}
            />
          </div>
        </div>
        <div className="col-span-full flex flex-row gap-6 sm:col-span-2">
          <Separator orientation="vertical" className="hidden sm:block" />
          <div className="col-span-full flex flex-col gap-6 sm:col-span-2">
            <div className="flex flex-row gap-6">
              <ItemForm
                action={
                  selectedPiece && selectedPiece.url !== null
                    ? "update"
                    : "create"
                }
                selectedPiece={selectedPiece}
                onItemCreate={(data) => {
                  if (!selectedPiece) return;
                  addItem({ setState: setOutfit, item: data });
                  setSelectedPiece({
                    type: data.type,
                    accessory: data.accessory,
                    url: data.url,
                  });
                }}
                onItemDelete={(data) => {
                  if (!selectedPiece) return;
                  const item = getOutfitItems(outfit).find(
                    (item) => item.url === data?.url,
                  );
                  if (!item) return;
                  deleteItem({ setState: setOutfit, item });
                  setSelectedPiece(null);
                }}
              />
            </div>
            <Separator orientation="horizontal" />
            <div className="flex min-h-96 flex-row gap-6">
              <OutfitSummaryTable items={getOutfitItems(outfit)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
