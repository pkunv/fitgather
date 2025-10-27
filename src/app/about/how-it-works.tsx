"use client";
import { ItemForm } from "@/components/item/item-form";
import { OutfitPiece } from "@/components/outfit/outfit-piece";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Label } from "@/components/ui/label";
import { TypographyH2 } from "@/components/ui/typography";
import { Cat, Lock, Shirt, Star } from "lucide-react";
import { toast } from "sonner";

export function HowItWorks() {
  return (
    <>
      <TypographyH2>How it works?</TypographyH2>
      <div className="flex items-center justify-center gap-2 text-xl text-muted-foreground">
        That&apos;s really simple!{" "}
        <div className="leading-3">
          <Cat className="mb-[-5px]" />
          <Shirt className="mt-[-3px]" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-center justify-center gap-6 rounded-md border bg-card p-4 drop-shadow-md">
          <div className="flex gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary p-2 text-primary-foreground">
              1.
            </span>
            First, grab a link with some type of clothing from a website of your
            choice.
          </div>
          <InputWithIcon
            readOnly
            value="https://www.shop.com/shirts/103-blue-striped-slim-fit - 🖱️ Copied!"
            className="rounded-md"
            endIcon={Star}
            startIcon={Lock}
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-6 rounded-md border bg-card p-4 drop-shadow-md">
          <div className="flex gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary p-2 text-primary-foreground">
              2.
            </span>
            Now click on the part of the outfit you want to replace and paste
            <br></br>
            the link into &apos;Item web address&apos; field, and click Add.
            <br></br>
            If your item is for example a braclet, a watch or earrings, click on
            part with &apos;+&apos; to assign this as an accessory.
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <div className="mx-auto flex w-[80%] gap-2 sm:w-[45%]">
              <OutfitPiece
                accessory={false}
                type="top"
                item={null}
                active={true}
              />
              <OutfitPiece
                accessory={true}
                type="top"
                item={null}
                active={false}
              />
            </div>
            <ItemForm
              selectedPiece={{
                type: "top",
                accessory: false,
                url: "https://www.shop.com/shirts/103-blue-striped-slim-fit",
              }}
              action="create"
              onItemCreate={() => {
                toast.info("That's a demo though!");
              }}
              onItemDelete={() => {
                toast.info("That's a demo though!");
              }}
              demo={true}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-6 rounded-md border bg-card p-4 drop-shadow-md">
          <div className="flex gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary p-2 text-primary-foreground">
              3.
            </span>
            When you gather all the items, your outfit is going to be saved to
            your browser memory.<br></br> You can save your outfit to your
            account by signing up and clicking &apos;Save outfit&apos;.
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Label>Outfit name</Label>
              <Input defaultValue="Untitled outfit" readOnly />
            </div>
            <Button className="w-full">Save outfit</Button>
          </div>
        </div>
      </div>
    </>
  );
}
