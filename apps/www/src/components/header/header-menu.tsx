import { type HeaderLink } from "@/components/header/_header";
import { AppLogo } from "@/components/header/app-logo";
import { MenuItem } from "@/components/header/menu-item";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function HeaderMenu({
  headerLinks,
  sheetLinks,
}: {
  headerLinks: HeaderLink[];
  sheetLinks: HeaderLink[];
}) {
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="sm:hidden">Menu</Button>
        </SheetTrigger>
        <SheetContent side={"left"} className="sm:max-w-xs">
          <nav className="flex flex-col items-baseline gap-6 self-center px-2 sm:py-4">
            <AppLogo />
            {sheetLinks.map((item) => (
              <MenuItem key={item.title} item={item} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <nav className="hidden flex-row gap-2 self-center sm:flex">
        {headerLinks.map((item) => (
          <MenuItem key={item.title} item={item} />
        ))}
      </nav>
    </>
  );
}
