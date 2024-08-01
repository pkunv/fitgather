"use client";

import { Button } from "@/app/_components/ui/button";
import { Checkbox } from "@/app/_components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { api, RouterOutputs } from "@/trpc/react";
import { itemSchema } from "@/trpc/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

const formSchema = itemSchema.create;

export function CreateItemForm({
  selectedPiece,
  callback,
}: {
  selectedPiece: {
    type: "head" | "top" | "bottom" | "shoes";
    accessory: boolean;
  } | null;
  callback: (data: RouterOutputs["item"]["create"]) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      type: "head",
      accessory: false,
    },
  });

  const createItem = api.item.create.useMutation({
    onSuccess: async (data) => {
      toast.success("Your item has been added!");
      form.reset();
      callback(data);
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
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="head">Head</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="shoes">Shoes</SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessory"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>This item is an accessory</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <div className="flex w-full justify-end">
          <Button type="submit">Add</Button>
        </div>
      </form>
    </Form>
  );
}
