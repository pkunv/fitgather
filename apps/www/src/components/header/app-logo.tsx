import { TypographyH1 } from "@/components/ui/typography";
import { Cat, Shirt } from "lucide-react";
import Link from "next/link";

export function AppLogo() {
  return (
    <Link className="flex flex-row gap-2" href={"/"}>
      <div className="leading-3">
        <Cat className="mb-[-5px]" />
        <Shirt className="mt-[-3px]" />
      </div>
      <TypographyH1>
        <span className="text-primary">fit</span>gather
      </TypographyH1>
    </Link>
  );
}
