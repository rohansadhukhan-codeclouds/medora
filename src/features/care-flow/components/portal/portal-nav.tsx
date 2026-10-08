"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Pill,
  UserRound,
} from "lucide-react";
import { SiteLogo } from "@/components/layout/site-logo";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/treatments", label: "Treatments", icon: Pill },
  { href: "/portal/orders", label: "Orders", icon: Package },
  { href: "/portal/messages", label: "Messages", icon: MessageSquare },
  { href: "/portal/profile", label: "Profile", icon: UserRound },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
        <SiteLogo href="/portal" className="mb-8 px-2" />
        <nav className="flex flex-1 flex-col gap-1" aria-label="Portal">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/portal"
                ? pathname === "/portal"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-muted text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function PortalMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card lg:hidden"
      aria-label="Portal mobile"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
