import { AppLogo } from "@/components/header/app-logo";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function Footer() {
  return (
    <>
      <Separator className="w-full" />
      <footer className="mx-auto flex w-full max-w-6xl flex-row justify-between gap-6 px-6 py-12 text-sm drop-shadow-sm sm:px-0">
        <nav className="flex flex-col">
          <ul>
            <li>
              <Link
                href="/explore"
                className={cn(buttonVariants({ variant: "link" }))}
              >
                Explore
              </Link>
            </li>
            <li>
              <Link
                href="/supported-shops"
                className={cn(buttonVariants({ variant: "link" }))}
              >
                Supported shops
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className={cn(buttonVariants({ variant: "link" }))}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className={cn(buttonVariants({ variant: "link" }))}
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex flex-col justify-end">
          <Link
            href="https://kunv.dev"
            target="_blank"
            className="text-right text-xl text-muted-foreground hover:underline"
          >
            Made by Kunv
          </Link>
          <AppLogo />
        </div>
      </footer>
    </>
  );
}
