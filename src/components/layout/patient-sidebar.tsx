"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteLogo } from "@/components/layout/site-logo";
import { patientNav } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function PatientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
      <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
        <SiteLogo href="/dashboard" className="mb-8 px-2" />
        <nav className="flex flex-1 flex-col gap-1" aria-label="Patient">
          {patientNav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

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
                {item.title}
              </Link>
            );
          })}
        </nav>
        <p className="px-3 text-xs leading-relaxed text-muted-foreground">
          Care information is provided through our licensed provider partners.
        </p>
      </div>
    </aside>
  );
}
