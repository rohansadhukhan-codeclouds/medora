"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  buildLiveBreadcrumbs,
  type BreadcrumbCrumb,
} from "@/lib/navigation/nav-history";
import { cn } from "@/lib/utils/cn";

type LiveBreadcrumbProps = {
  currentLabel: string;
  fallbackOriginHref?: string;
  className?: string;
};

function fallbackCrumbs(
  currentLabel: string,
  fallbackOriginHref: string,
): BreadcrumbCrumb[] {
  return [
    { href: "/", label: "Home" },
    { href: fallbackOriginHref, label: "Treatments" },
    { label: currentLabel },
  ];
}

function crumbsEqual(a: BreadcrumbCrumb[], b: BreadcrumbCrumb[]) {
  if (a.length !== b.length) return false;
  return a.every(
    (crumb, index) =>
      crumb.href === b[index]?.href && crumb.label === b[index]?.label,
  );
}

export function LiveBreadcrumb({
  currentLabel,
  fallbackOriginHref = "/treatments",
  className,
}: LiveBreadcrumbProps) {
  const pathname = usePathname();
  const [crumbs, setCrumbs] = useState<BreadcrumbCrumb[]>(() =>
    fallbackCrumbs(currentLabel, fallbackOriginHref),
  );

  useEffect(() => {
    const next = buildLiveBreadcrumbs({
      currentPath: pathname,
      currentLabel,
      fallbackOriginHref,
    });
    setCrumbs((prev) => (crumbsEqual(prev, next) ? prev : next));
  }, [pathname, currentLabel, fallbackOriginHref]);

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li
              key={`${crumb.href ?? "current"}-${crumb.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {index > 0 ? (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 opacity-60"
                  aria-hidden="true"
                />
              ) : null}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate",
                    isLast ? "font-medium text-foreground" : undefined,
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
