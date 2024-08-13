"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { api, type RouterOutputs } from "@/trpc/react";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ItemSelect({
  onSelect,
}: {
  onSelect: (item: RouterOutputs["item"]["getMany"][0]) => void;
}) {
  const [item, setItem] = useState<RouterOutputs["item"]["getMany"][0] | null>(
    null,
  );
  const { data, refetch, isLoading } = api.item.getMany.useQuery(
    { title: undefined },
    {
      enabled: false,
    },
  );

  return (
    <div className="flex flex-col gap-4">
      <Label>Existing item</Label>
      <Select
        value={item?.id}
        onOpenChange={async () => {
          await refetch();
        }}
        onValueChange={(value) => {
          const item = data?.find((item) => item.id === value);
          onSelect(item!);
          setItem(null);
        }}
      >
        <SelectTrigger className="h-20">
          <SelectValue placeholder="Select an existing item" />
        </SelectTrigger>
        <SelectContent>
          {isLoading && <Spinner />}

          {data?.map((item) => (
            <SelectItem key={item.id} value={item.id} className="h-20">
              {item.title}
              <div className="flex items-center gap-2">
                <Image
                  alt={item.title}
                  src={item.image}
                  width={23}
                  height={23}
                />
                {item.price} {item.currency}
              </div>{" "}
            </SelectItem>
          ))}
          {data?.length === 0 && <Sparkles />}
        </SelectContent>
      </Select>
    </div>
  );
}
