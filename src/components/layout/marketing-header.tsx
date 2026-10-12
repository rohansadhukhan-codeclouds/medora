"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type HTMLAttributes } from "react";
import { Menu, X } from "lucide-react";
import { SiteLogo } from "@/components/layout/site-logo";
import { Button } from "@/components/ui/button";
import { HeaderCartButton } from "@/features/cart/components/header-cart-button";
import { marketingNav } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-sm transition-[background-color,box-shadow,border-color] duration-[var(--motion-normal)] ease-[var(--motion-ease-standard)]",
        scrolled && "motion-header-scrolled",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <SiteLogo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {marketingNav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active ? "true" : "false"}
                className={cn(
                  "motion-nav-link text-sm font-medium text-muted-foreground hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <HeaderCartButton />
          <Button asChild>
            <Link href="/#products">Get Started</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <HeaderCartButton />
          <button
            type="button"
            className="motion-pressable inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className="motion-mobile-panel border-b border-border bg-card md:hidden"
        data-open={open ? "true" : "false"}
        aria-hidden={!open}
        {...(!open ? ({ inert: true } as HTMLAttributes<HTMLDivElement>) : {})}
      >
        <div className="motion-mobile-panel-inner">
          <nav
            className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4"
            aria-label="Mobile"
          >
            {marketingNav.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="motion-mobile-link rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                style={{ transitionDelay: open ? `${index * 45}ms` : "0ms" }}
                onClick={() => setOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            <div
              className="motion-mobile-link mt-3 flex flex-col gap-2"
              style={{
                transitionDelay: open
                  ? `${marketingNav.length * 45}ms`
                  : "0ms",
              }}
            >
              <Button asChild variant="outline">
                <Link href="/cart" onClick={() => setOpen(false)}>
                  Cart
                </Link>
              </Button>
              <Button asChild>
                <Link href="/#products" onClick={() => setOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
