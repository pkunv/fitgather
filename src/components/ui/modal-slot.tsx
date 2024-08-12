"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import {
  usePathname,
  useRouter,
  useSelectedLayoutSegment,
} from "next/navigation";
import { useEffect, useState } from "react";

export default function ModalSlot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const capitalize = (s: string) => s && s[0]?.toUpperCase() + s.slice(1);
  const pathname = usePathname();
  const dialogTitle = pathname
    ? capitalize(
        pathname
          .split("/")
          [pathname.split("/").length - 1]?.replaceAll("-", " ") ?? "",
      )
    : "";
  const segment = useSelectedLayoutSegment("modal");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log(segment);
    setOpen(segment !== null);
  }, [segment]);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(false);
      router.back();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn("min-h-80 items-center", className ?? "")}>
          <DialogHeader>
            <DialogTitle className="hidden">{dialogTitle}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}
