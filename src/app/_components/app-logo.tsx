import { TypographyH1 } from "@/app/_components/ui/typography";
import { Cat, Shirt } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex flex-row gap-2">
      <div className="leading-3">
        <Cat className="mb-[-5px]" />
        <Shirt className="mt-[-3px]" />
      </div>
      <TypographyH1>fitgather</TypographyH1>
    </div>
  );
}
