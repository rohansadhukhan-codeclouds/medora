import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Package,
  Pill,
  UserRound,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  description?: string;
};

export type AccountNavItem = NavItem & {
  icon: LucideIcon;
};

export const marketingNav: NavItem[] = [
  { title: "Products", href: "/treatments" },
  { title: "How it works", href: "/how-it-works" },
  { title: "FAQ", href: "/faq" },
  { title: "About", href: "/about" },
];

/** Lightweight account area — secondary to the storefront funnel */
export const accountNav: AccountNavItem[] = [
  { title: "Overview", href: "/account", icon: LayoutDashboard },
  { title: "My Treatment", href: "/account/treatment", icon: Pill },
  { title: "Orders", href: "/account/orders", icon: Package },
  { title: "Subscription", href: "/account/subscription", icon: CreditCard },
  { title: "Messages", href: "/account/messages", icon: MessageSquare },
  { title: "Profile", href: "/account/profile", icon: UserRound },
];

/** @deprecated Use accountNav — kept for any leftover patient layout imports */
export const patientNav: AccountNavItem[] = [
  { title: "Overview", href: "/account", icon: LayoutDashboard },
  { title: "Intake", href: "/intake", icon: ClipboardList },
  { title: "My Treatment", href: "/account/treatment", icon: Pill },
  { title: "Orders", href: "/account/orders", icon: Package },
  { title: "Messages", href: "/account/messages", icon: MessageSquare },
  { title: "Profile", href: "/account/profile", icon: UserRound },
];
