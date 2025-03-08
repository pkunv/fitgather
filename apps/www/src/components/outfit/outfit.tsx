"use client";

import { OutfitPiece } from "@/components/outfit/outfit-piece";
import { type itemSchema, type outfitSchema } from "@/trpc/schemas";
import { type Dispatch, type SetStateAction, useState } from "react";
import { type z } from "zod";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import Image from "next/image";

export function Outfit({
  outfit,
  selectedPiece,
  setSelectedPiece,
}: {
  outfit: z.infer<typeof outfitSchema.create>;
  selectedPiece?: z.infer<typeof itemSchema.select>;
  setSelectedPiece?: Dispatch<
    SetStateAction<{
      type: "head" | "top" | "bottom" | "shoes";
      accessory: boolean;
      url: string | null;
      accessoryIndex?: number | undefined;
    } | null>
  >;
}) {
  const [expandImage, setExpandImage] = useState<string | false>(false);
  const [expandedItem, setExpandedItem] = useState<z.infer<
    typeof itemSchema.get
  > | null>(null);

  return (
    <>
      <Dialog
        open={expandImage !== false}
        onOpenChange={() => {
          setExpandImage(false);
          setExpandedItem(null);
        }}
      >
        <DialogContent className="min-h-96">
          <DialogHeader>
            <Image
              src={expandImage as string}
              width={1024}
              height={1024}
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAARAAwDAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAACAEF/8QAJRAAAAUEAgICAwAAAAAAAAAAAQIDBAUGBwgRABITMQkhMmFi/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEQMRAD8A1c+8qr40PkO+om2Ffy1PRcLFMWzhJl4xIq5WKK5zj2KbRgIqmXYaHQcsDYw/uFPXTxtoas6kkDu5hwwO2kHCv5rOG6yiB1Df0bx9h/Y8gAd9bZVbcvK3IZUaXlRRgaUkJqPcmZqgm4Wbs2JUipGEvU4jpQAAoiOwHlDD+N9OXRxTgU5qMeR6wScqYiDtudFQEzPFDFHqcANod7AdffJQng9cCG98D//Z"
              placeholder="blur"
              alt="Expanded image"
            />
            {expandedItem?.description && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {expandedItem.description}
              </p>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="col-span-full grid h-fit w-full grid-cols-3 grid-rows-4 gap-4 justify-self-end bg-background sm:col-span-3">
        {/* MAIN ITEMS TOP TO BOTTOM */}
        <div className="col-start-2 row-start-1">
          <OutfitPiece
            type="head"
            accessory={false}
            item={outfit.head.main}
            active={selectedPiece?.type === "head" && !selectedPiece?.accessory}
            onClick={setSelectedPiece}
            onExpandImage={(url) => {
              if (setExpandImage) {
                setExpandImage(url);
                setExpandedItem(outfit.head.main);
              }
            }}
          />
        </div>
        <div className="col-start-2 row-start-2">
          <OutfitPiece
            type="top"
            accessory={false}
            item={outfit.top.main}
            active={selectedPiece?.type === "top" && !selectedPiece?.accessory}
            onClick={setSelectedPiece}
            onExpandImage={(url) => {
              setExpandImage(url);
              setExpandedItem(outfit.top.main);
            }}
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
            onExpandImage={(url) => {
              setExpandImage(url);
              setExpandedItem(outfit.bottom.main);
            }}
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
            onExpandImage={(url) => {
              setExpandImage(url);
              setExpandedItem(outfit.shoes.main);
            }}
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
              selectedPiece.accessoryIndex === 0
            }
            item={
              outfit.head.accessories?.[0] ? outfit.head.accessories[0] : null
            }
            onClick={setSelectedPiece}
            onExpandImage={(url) => {
              setExpandImage(url);
              setExpandedItem(outfit.head.accessories?.[0] ?? null);
            }}
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
            onExpandImage={(url) => {
              setExpandImage(url);
              setExpandedItem(outfit.head.accessories?.[1] ?? null);
            }}
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
            onExpandImage={(url) => {
              setExpandImage(url);
              setExpandedItem(outfit.top.accessories?.[0] ?? null);
            }}
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
            onExpandImage={(url) => {
              setExpandImage(url);
              setExpandedItem(outfit.top.accessories?.[1] ?? null);
            }}
          />
        </div>
      </div>
    </>
  );
}
