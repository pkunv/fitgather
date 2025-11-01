"use client";

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
import { api } from "@/trpc/react";
import { queueSchema } from "@/trpc/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

const formSchema = queueSchema.addToQueue;

export function QueueForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const addToQueue = api.item.addToQueue.useMutation({
    onSuccess: async () => {
      toast.success("Item has been added to the queue!");
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addToQueue.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://www.shop.com/items/product-url"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the URL of the item to add to the Spatula queue.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex w-full justify-end">
          <Button
            type="submit"
            className="gap-2"
            disabled={addToQueue.isPending}
          >
            {addToQueue.isPending ? (
              <Spinner className="grayscale invert" />
            ) : (
              <>
                <Plus />
                Add to Queue
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
