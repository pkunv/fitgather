"use client";

import { Button } from "@/app/_components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { Spinner } from "@/app/_components/ui/spinner";
import { api, type RouterOutputs } from "@/trpc/react";
import { itemSchema } from "@/trpc/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

const formSchema = itemSchema.create;

export function CreateItemForm({
  action,
  selectedPiece,
  onItemCreate,
  onItemDelete,
}: {
  action: "create" | "update";
  selectedPiece: z.infer<typeof itemSchema.select>;
  onItemCreate: (data: RouterOutputs["item"]["create"]) => void;
  onItemDelete: (data: z.infer<typeof itemSchema.select>) => void;
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
    createItem.mutate(values);
  }

  useEffect(() => {
    if (!selectedPiece) return;
    console.log(selectedPiece);
    form.setValue("type", selectedPiece.type);
    form.setValue("accessory", selectedPiece.accessory);
    if (selectedPiece.url) form.setValue("url", selectedPiece.url);
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
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We currently support clothing items from: Zalando and Vinted.
                Other shops may still work though!
              </FormDescription>
              <FormMessage />
              <FormMessage>{form.formState.errors.type?.message}</FormMessage>
            </FormItem>
          )}
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
