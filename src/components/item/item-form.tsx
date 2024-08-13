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
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

const formSchema = itemSchema.create;

export function ItemForm({
  action,
  selectedPiece,
  onItemCreate,
  onItemDelete,
  demo,
}: {
  action: "create" | "update";
  selectedPiece: z.infer<typeof itemSchema.select>;
  onItemCreate: (data: RouterOutputs["item"]["create"]) => void;
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
      toast.info("That's a demo though!");
      return;
    }
    createItem.mutate(values);
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
                  placeholder="https://www.zalando.pl/polo-ralph-lauren-short-sleeve-koszulka-polo-athletic-green-multi-po222p0pi-m11.html"
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
                list to see if you can submit your item.
              </FormDescription>
              <FormMessage />
              <FormMessage>{form.formState.errors.type?.message}</FormMessage>
            </FormItem>
          )}
        />

        <ItemSelect
          onSelect={(item) => {
            onItemCreate({
              ...item,
              type: item.type as "head" | "top" | "bottom" | "shoes",
            });
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

          <Button type="submit">
            {createItem.isPending ? (
              <Spinner className="grayscale invert" />
            ) : action === "update" ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
