import { TypographyLead } from "@/components/ui/typography";
import { Sparkles } from "lucide-react";

export function OutfitEmptyList() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Sparkles size={64} />
      <TypographyLead>No results found.</TypographyLead>
    </div>
  );
}
