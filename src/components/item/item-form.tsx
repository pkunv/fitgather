"use client";

import { ItemSelect } from "@/components/item/item-select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, type RouterOutputs } from "@/trpc/react";
import { itemSchema } from "@/trpc/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

const formSchema = itemSchema.create;

const loadingMessages = [
  "Inspecting fabric quality...",
  "Looking around for pricing...",
  "Closing cookie pop-ups...",
  "Checking if it's machine washable...",
  "Measuring the inseam...",
  "Consulting with fashion experts...",
  "Analyzing the latest trends...",
  "Checking size availability...",
  "Reading customer reviews...",
  "Verifying authenticity...",
];

export function ItemForm({
  action,
  selectedPiece,
  onItemCreate,
  onItemDelete,
  demo,
}: {
  action: "create" | "update";
  selectedPiece: z.infer<typeof itemSchema.select>;
  onItemCreate: (
    data: RouterOutputs["item"]["create"],
    isFromItemList?: boolean,
  ) => void;
  onItemDelete: (data: z.infer<typeof itemSchema.select>) => void;
  demo?: boolean;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: selectedPiece?.url ?? "",
      type: selectedPiece?.type ?? undefined,
      accessory: selectedPiece?.accessory ?? undefined,
    },
  });

  const createItem = api.item.create.useMutation({
    onSuccess: async (data) => {
      toast.success("Your item has been added!");
      form.reset();
      onItemCreate(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (demo) {
      toast.info("This is only a demo though!");
      return;
    }

    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      toast.info(loadingMessages[randomIndex], { duration: 3000 });
    }, 3000);

    createItem.mutate(values, {
      onSettled: () => {
        clearInterval(intervalId);
      },
    });
  }

  useEffect(() => {
    if (!selectedPiece) return;
    form.setValue("type", selectedPiece.type);
    form.setValue("accessory", selectedPiece.accessory);
    if (selectedPiece.url) form.setValue("url", selectedPiece.url);
    if (!selectedPiece.url) form.setValue("url", "");
  }, [selectedPiece, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item web address</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://www.shop.com/shirts/103-blue-striped-slim-fit"
                  readOnly={demo}
                  {...field}
                />
              </FormControl>

              <FormDescription>
                See our{" "}
                <Link
                  href="/supported-shops"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  supported shops
                </Link>{" "}
                page for more info on submitting items.
              </FormDescription>
              <FormMessage />
              <FormMessage>{form.formState.errors.type?.message}</FormMessage>
            </FormItem>
          )}
        />

        <ItemSelect
          onSelect={(item) => {
            onItemCreate(
              // @ts-expect-error - TODO: fix this
              {
                ...item,
                type: item.type as "head" | "top" | "bottom" | "shoes",
                merchant: item.brand,
                isClothing: true,
              },
              true,
            );
            form.setValue("url", item.url);
          }}
        />
        <div className="flex w-full justify-end gap-2">
          {action === "update" && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                onItemDelete(selectedPiece);
                form.reset();
              }}
            >
              <Trash2 />
            </Button>
          )}

          <Button type="submit" className="gap-2">
            {createItem.isPending ? (
              <Spinner className="grayscale invert" />
            ) : action === "update" ? (
              <>
                <Save />
                Update
              </>
            ) : (
              <>
                <Plus />
                Add
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
