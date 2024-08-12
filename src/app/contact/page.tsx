import { TypographyH1, TypographyLead } from "@/components/ui/typography";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  return (
    <>
      <TypographyH1>Contact</TypographyH1>
      <div className="flex flex-row gap-2">
        <TypographyLead>Email:</TypographyLead>
        <Link
          href="mailto:kuncypiotr@gmail.com"
          className="scroll-m-20 text-xl font-semibold tracking-tight hover:underline"
        >
          kuncypiotr@gmail.com
        </Link>
      </div>
      <div className="flex flex-row gap-2">
        <TypographyLead>Github:</TypographyLead>
        <Link
          href="https://github.com/pkunv"
          target="_blank"
          className="scroll-m-20 text-xl font-semibold tracking-tight hover:underline"
        >
          pkunv
        </Link>
      </div>
      <div className="flex flex-row gap-2">
        <TypographyLead>Github repo:</TypographyLead>
        <Link
          href="https://github.com/pkunv/fitgather"
          target="_blank"
          className="scroll-m-20 text-xl font-semibold tracking-tight hover:underline"
        >
          fitgather
        </Link>
      </div>
    </>
  );
}
