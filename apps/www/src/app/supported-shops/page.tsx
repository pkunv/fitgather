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
        Here is a list of oficially supported E-Commerce clothing websites, that
        has been tested.
        <br />
        Other e-commerce shops are also possibly supported! fitgather will try
        its best to automatically handle it for you.
      </TypographyMuted>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shop</TableHead>
            <TableHead>Regions</TableHead>
            <TableHead>Supported</TableHead>
            <TableHead>Photo Analysis</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...providers]
            .sort((a, b) => {
              // Sort by isSupported (true first)
              if (a.isSupported && !b.isSupported) return -1;
              if (!a.isSupported && b.isSupported) return 1;
              // If both have same support status, sort alphabetically by name
              return a.name.localeCompare(b.name);
            })
            .map((provider) => {
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
                    {provider.isSupported === true &&
                    provider.regions[0] === "All" ? (
                      <Check />
                    ) : provider.isSupported &&
                      provider.regions[0] !== "All" ? (
                      "Not guaranteed"
                    ) : provider.isSupported === "partially" ? (
                      "Partially"
                    ) : (
                      <X />
                    )}
                  </TableCell>
                  <TableCell>
                    {provider.isPhotoAnalysisSupported ? <Check /> : <X />}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </>
  );
}
