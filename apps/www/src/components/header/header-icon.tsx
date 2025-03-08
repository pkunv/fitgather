import {
  Bell,
  BookOpenCheck,
  Cog,
  Home,
  LogIn,
  LogOut,
  Plus,
  Search,
  User2,
  UserRoundPlus,
  Wallet,
} from "lucide-react";

export type HeaderIcon =
  | "Home"
  | "Search"
  | "LogIn"
  | "User2"
  | "LogOut"
  | "BookOpenCheck"
  | "Wallet"
  | "UserRoundPlus"
  | "Bell"
  | "Cog"
  | "Plus";

export function HeaderIcon({
  icon,
  className,
  strokeWidth = 2,
}: {
  icon: HeaderIcon;
  className?: string;
  strokeWidth?: number;
}) {
  const iconMap = {
    Home: Home,
    Search: Search,
    LogIn: LogIn,
    User2: User2,
    LogOut: LogOut,
    BookOpenCheck: BookOpenCheck,
    Wallet: Wallet,
    UserRoundPlus: UserRoundPlus,
    Bell: Bell,
    Cog: Cog,
    Plus: Plus,
  };

  const Icon = iconMap[icon];
  return (
    <Icon
      className={className}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={true}
    />
  );
}
