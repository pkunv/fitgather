"use client";

import { ItemCard } from "@/components/item/item-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/lib/use-debounce";
import { api, type RouterOutputs } from "@/trpc/react";
import { Search, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ItemSelect({
  onSelect,
  selectedItem,
}: {
  onSelect: (item: RouterOutputs["item"]["getMany"][0]) => void;
  selectedItem?: RouterOutputs["item"]["getMany"][0] | null;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data, isLoading } = api.item.getMany.useQuery(
    { query: debouncedSearch || undefined },
    {
      enabled: open,
    },
  );

  const handleSelectItem = (item: RouterOutputs["item"]["getMany"][0]) => {
    onSelect(item);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-4">
      <Label>Existing item</Label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {selectedItem ? (
            <Button
              variant="outline"
              className="h-auto justify-start gap-3 p-3"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm bg-muted">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="line-clamp-2 text-left">
                {selectedItem.title}
              </span>
            </Button>
          ) : (
            <Button variant="outline" className="gap-2">
              <Search />
              Select from catalogue
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Item from Catalogue</DialogTitle>
            <DialogDescription>
              Search and select an item from fitgather&apos;s catalogue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : data && data.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {data.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => handleSelectItem(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No items found" : "Start typing to search"}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
