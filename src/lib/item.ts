import { type itemSchema, type outfitSchema } from "@/trpc/schemas";
import { type Dispatch, type SetStateAction } from "react";
import { type z } from "zod";

export function getOutfitItems(outfit: z.infer<typeof outfitSchema.create>) {
  return [
    outfit.head.main,
    outfit.top.main,
    outfit.bottom.main,
    outfit.shoes.main,
    ...((outfit.head.accessories as [] | null) ?? []),
    ...((outfit.top.accessories as [] | null) ?? []),
    ...((outfit.bottom.accessories as [] | null) ?? []),
    ...((outfit.shoes.accessories as [] | null) ?? []),
  ].filter((item) => item !== null);
}

export function getOutfitFromItems(items: z.infer<typeof itemSchema.get>[]) {
  const outfit = {
    head: { main: null, accessories: null },
    top: { main: null, accessories: null },
    bottom: { main: null, accessories: null },
    shoes: { main: null, accessories: null },
  } as z.infer<typeof outfitSchema.create>;

  items.forEach((item) => {
    if (item.accessory) {
      outfit[item.type].accessories = outfit.head.accessories
        ? [...(outfit.head.accessories as []), item]
        : [item];
    }
    outfit[item.type].main = item;
  });
  return outfit;
}

export function addItem({
  setState,
  item,
}: {
  setState: Dispatch<SetStateAction<z.infer<typeof outfitSchema.create>>>;
  item: z.infer<typeof itemSchema.get>;
}) {
  if (!item) return;
  setState((prev) => {
    const newState = {
      ...prev,
      [item.type]: item.accessory
        ? {
            main: prev[item.type].main,
            accessories: prev[item.type].accessories
              ? [...(prev[item.type].accessories as []), item]
              : [item],
          }
        : { accessories: prev[item.type].accessories, main: item },
    };
    window.localStorage.setItem("outfit", JSON.stringify(newState));
    return newState;
  });
}

export function deleteItem({
  setState,
  item,
}: {
  setState: Dispatch<SetStateAction<z.infer<typeof outfitSchema.create>>>;
  item: z.infer<typeof itemSchema.get>;
}) {
  if (!item) return;
  setState((prev) => {
    const newState = {
      ...prev,
      [item.type]: item.accessory
        ? {
            main: prev[item.type].main,
            accessories: prev[item.type].accessories
              ? (prev[item.type].accessories as [] | null)?.filter(
                  (acc) => acc !== item,
                )
              : null,
          }
        : { accessories: prev[item.type].accessories, main: null },
    };
    window.localStorage.setItem("outfit", JSON.stringify(newState));
    return newState;
  });
}
