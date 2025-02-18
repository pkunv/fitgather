import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type itemSchema } from "@/trpc/schemas";
import Link from "next/link";
import { type z } from "zod";

export function OutfitSummaryTable({
  items,
}: {
  items: z.infer<typeof itemSchema.get>[];
}) {
  const capitalize = (s: string) => s && s[0]?.toUpperCase() + s.slice(1);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Type</TableHead>
          <TableHead>Item</TableHead>
          <TableHead className="w-[150px] text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index}>
            <TableCell>
              {capitalize(item.type)}
              {item.accessory === true && (
                <Badge variant={"secondary"} className="ml-2 px-1">
                  A
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <Link href={item.url} target="_blank" className="underline">
                {item.title}
              </Link>
            </TableCell>
            <TableCell className="text-right">
              {item.price} {item.currency}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {items.length > 0 && (
        <TableFooter>
          {[...new Set(items.map((item) => item.currency))].length > 1 ? (
            [...new Set(items.map((item) => item.currency))].map((currency) => (
              <TableRow key={currency}>
                <TableCell colSpan={2}>Total ({currency})</TableCell>
                <TableCell className="text-right">
                  {items
                    .filter((item) => item.currency === currency)
                    .reduce((acc, val) => val.price + acc, 0)}{" "}
                  {currency}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">
                {items.reduce((acc, val) => val.price + acc, 0)}{" "}
                {items.find((item) => item)?.currency}
              </TableCell>
            </TableRow>
          )}
        </TableFooter>
      )}
    </Table>
  );
}
