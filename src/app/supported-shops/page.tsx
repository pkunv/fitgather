import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TypographyH2, TypographyMuted } from "@/components/ui/typography";
import { providers } from "@/lib/provider";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Supported shops",
};

export default function SupportedShopsPage() {
  return (
    <>
      <TypographyH2>Supported shops</TypographyH2>
      <TypographyMuted>
        Here is a list of supported E-Commerce clothing websites. Every shop
        that is not supported but it is on the list, will be supported in the
        future.
      </TypographyMuted>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shop</TableHead>
            <TableHead>Regions</TableHead>
            <TableHead>Supported</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => {
            return (
              <TableRow key={provider.name}>
                <TableCell>
                  <Link
                    href={provider.url}
                    target="_blank"
                    className={cn(buttonVariants({ variant: "link" }))}
                  >
                    {provider.fullname}
                  </Link>{" "}
                </TableCell>
                <TableCell>{provider.regions?.join(", ")}</TableCell>
                <TableCell>
                  {provider.resolve !== null ? <Check /> : <X />}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
