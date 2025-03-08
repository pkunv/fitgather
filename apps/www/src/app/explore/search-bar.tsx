"use client";

import { InputWithIcon } from "@/components/ui/input-with-icon";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = useDebouncedCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value === null) params.delete(name);
      params.set("q", value!);
      router.replace(`${pathname}?${params.toString()}`);
    },
    500,
  );

  return (
    <InputWithIcon
      startIcon={Search}
      placeholder="Search by brands, colors and keywords..."
      defaultValue={searchParams.get("q") ?? ""}
      onChange={(e) => handleSearch("q", e.target.value)}
      type="search"
    />
  );
}
