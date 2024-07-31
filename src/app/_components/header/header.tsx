import { AppLogo } from "@/app/_components/app-logo";
import { HeaderMenu } from "@/app/_components/header/header-menu";
import { api } from "@/trpc/server";

export async function Header() {
  const links = await api.layout.getLinks();

  return (
    <header className="mx-auto flex w-full max-w-7xl flex-row justify-around gap-6 px-6 py-2 drop-shadow-sm">
      <AppLogo />
      <HeaderMenu headerLinks={links.header} sheetLinks={links.sheet} />
    </header>
  );
}
