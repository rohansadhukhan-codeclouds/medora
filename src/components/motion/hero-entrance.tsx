"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils/cn";

type HeroEntranceProps = {
  children: ReactNode;
  className?: string;
};

/**
 * One-shot hero stagger on mount. Reduced-motion users see content immediately.
 */
export function HeroEntrance({ children, className }: HeroEntranceProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);
  const show = reducedMotion || ready;

  useEffect(() => {
    if (reducedMotion) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [reducedMotion]);

  return (
    <div
      className={cn("motion-hero", show && "motion-hero-ready", className)}
      data-hero-ready={show ? "true" : "false"}
    >
      {children}
    </div>
  );
}

type HeroItemProps = {
  children: ReactNode;
  className?: string;
  index?: number;
};

export function HeroItem({ children, className, index = 0 }: HeroItemProps) {
  return (
    <div
      className={cn("motion-hero-item", className)}
      style={{ ["--hero-index" as string]: String(index) }}
    >
      {children}
    </div>
  );
}
