"use client";

import { ItemForm } from "@/components/item/item-form";
import { Outfit } from "@/components/outfit/outfit";
import { OutfitSummaryTable } from "@/components/outfit/outfit-summary-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { TypographyMuted } from "@/components/ui/typography";
import { addItem, deleteItem, getOutfitItems } from "@/lib/item";
import { api, type RouterOutputs } from "@/trpc/react";
import { type itemSchema, outfitSchema } from "@/trpc/schemas";
import { type KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type z } from "zod";

const formSchema = outfitSchema.create;

export function OutfitForm({
  data,
  action,
  user,
}: {
  data?: RouterOutputs["outfit"]["get"];
  action: "create" | "update";
  user: KindeUser | null;
}) {
  const router = useRouter();
  const [outfit, setOutfit] = useState<z.infer<typeof formSchema>>(
    data
      ? data.outfit
      : {
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
        },
  );
  const [selectedPiece, setSelectedPiece] =
    useState<z.infer<typeof itemSchema.select>>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) return;
    const localStorageOutfit = window.localStorage
      ? (JSON.parse(localStorage.getItem("outfit") ?? "null") as z.infer<
          typeof formSchema
        > | null)
      : null;
    if (!localStorageOutfit) return;
    setOutfit(localStorageOutfit);
  }, [data]);

  const createOutfit = api.outfit.create.useMutation({
    onSuccess: async (data) => {
      toast.success(`Your outfit has been created!`);
      localStorage.removeItem("outfit");
      router.push(`/outfits/${data.slug}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <div className="grid grid-cols-5 grid-rows-1 gap-4">
        <Outfit
          outfit={outfit}
          selectedPiece={selectedPiece}
          setSelectedPiece={setSelectedPiece}
        />
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
            <div className="flex min-h-96 flex-col gap-6">
              <OutfitSummaryTable items={getOutfitItems(outfit)} />
              {!user && (
                <TypographyMuted>
                  Sign in or sign up to save your outfit & more!
                </TypographyMuted>
              )}
              {user && (
                <>
                  <div className="flex flex-col gap-3">
                    <Label>Outfit name</Label>
                    <Input
                      placeholder="Untitled outfit"
                      ref={inputRef}
                      defaultValue={data?.name ? data.name : undefined}
                    />
                  </div>

                  <Button
                    className="w-full"
                    disabled={getOutfitItems(outfit).length === 0}
                    onClick={() => {
                      createOutfit.mutate({
                        name: inputRef.current?.value ?? null,
                        outfit,
                      });
                    }}
                  >
                    {createOutfit.isPending ? (
                      <Spinner className="grayscale invert" />
                    ) : (
                      "Save outfit"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
