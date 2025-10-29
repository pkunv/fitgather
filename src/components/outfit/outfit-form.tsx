"use client";

import { ItemForm } from "@/components/item/item-form";
import { Outfit } from "@/components/outfit/outfit";
import { OutfitSummary } from "@/components/outfit/outfit-summary";
import { OutfitSummaryTable } from "@/components/outfit/outfit-summary-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { TypographyMuted } from "@/components/ui/typography";
import { addItem, cn, deleteItem, getOutfitItems } from "@/lib/utils";
import { type User } from "@/server/api/trpc";
import { api, type RouterOutputs } from "@/trpc/react";
import { type itemSchema, outfitSchema } from "@/trpc/schemas";
import { ResetIcon } from "@radix-ui/react-icons";
import { Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { type z } from "zod";

const formSchema = outfitSchema.create;

export function OutfitForm({
  data,
  action,
  user,
}: {
  data?: RouterOutputs["outfit"]["get"];
  action: "create" | "update";
  user: User | null;
}) {
  const router = useRouter();

  const emptyOutfit = {
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
  };
  const [resetOutfitOpen, setResetOutfitOpen] = useState(false);
  const [outfit, setOutfit] = useState<z.infer<typeof formSchema>>(
    data ? data.outfit : emptyOutfit,
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
      router.refresh();
      router.push(`/outfits/${data.code}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateOutfit = api.outfit.update.useMutation({
    onSuccess: async () => {
      toast.success(`Your outfit has been updated!`);
      router.refresh();
      localStorage.removeItem("outfit");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteOutfit = api.outfit.delete.useMutation({
    onSuccess: async () => {
      toast.success(`Your outfit has been deleted!`);
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const debouncedUpdateOutfit = useDebouncedCallback(() => {
    action === "update" &&
      data?.id &&
      updateOutfit.mutate({
        id: data?.id,
        name: inputRef.current?.value ?? null,
        outfit,
      });
  }, 1000);

  return (
    <>
      {action === "update" && data && <OutfitSummary data={data} user={user} />}
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
                onItemCreate={(callbackData, isFromItemList) => {
                  if (!selectedPiece && !isFromItemList) return;
                  addItem({ setState: setOutfit, item: callbackData });
                  setSelectedPiece({
                    type: callbackData.type,
                    accessory: callbackData.accessory,
                    url: callbackData.url,
                  });

                  debouncedUpdateOutfit();
                }}
                onItemDelete={(callbackData) => {
                  if (!selectedPiece) return;
                  const item = getOutfitItems(outfit).find(
                    (item) => item.url === callbackData?.url,
                  );
                  if (!item) return;
                  deleteItem({ setState: setOutfit, item });
                  setSelectedPiece(null);

                  debouncedUpdateOutfit();
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
                  <div className="flex flex-row gap-2">
                    <AlertDialog
                      open={resetOutfitOpen}
                      onOpenChange={setResetOutfitOpen}
                    >
                      <AlertDialogTrigger
                        className={cn(
                          buttonVariants({ variant: "secondary" }),
                          "gap-2",
                        )}
                      >
                        <ResetIcon />
                        Reset
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will reset your
                            outfit.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="gap-2"
                            onClick={() => {
                              setOutfit(emptyOutfit);
                              setSelectedPiece(null);
                              localStorage.removeItem("outfit");
                              setResetOutfitOpen(false);
                            }}
                          >
                            <ResetIcon />
                            Reset
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {action === "update" && data && (
                      <AlertDialog>
                        <AlertDialogTrigger
                          className={cn(
                            buttonVariants({ variant: "secondary" }),
                          )}
                        >
                          <Trash2 />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your outfit.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteOutfit.mutate({ code: data.code });
                              }}
                            >
                              {deleteOutfit.isPending ? (
                                <Spinner className="grayscale invert" />
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    <Button
                      className="w-full gap-2"
                      disabled={getOutfitItems(outfit).length === 0}
                      onClick={() => {
                        action === "update" &&
                          data?.id &&
                          updateOutfit.mutate({
                            id: data?.id,
                            name: inputRef.current?.value ?? null,
                            outfit,
                          });

                        action === "create" &&
                          createOutfit.mutate({
                            name: inputRef.current?.value ?? null,
                            outfit,
                          });
                      }}
                    >
                      {createOutfit.isPending || updateOutfit.isPending ? (
                        <Spinner className="grayscale invert" />
                      ) : (
                        <>
                          <Save />
                          Save outfit
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
