"use client";

import { useEffect, useState, type ElementType, type ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { revealClass } from "@/lib/motion/variants";
import { cn } from "@/lib/utils/cn";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delayMs?: number;
  once?: boolean;
  /** `mount` = animate on first paint (above-the-fold pages like cart). */
  trigger?: "view" | "mount";
};

export function Reveal({
  children,
  className,
  as: Tag = "div",
  delayMs = 0,
  once = true,
  trigger = "view",
}: RevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLElement>({
    once,
    disabled: trigger === "mount",
  });
  const [mountedIn, setMountedIn] = useState(false);

  useEffect(() => {
    if (trigger !== "mount" || reducedMotion) return;
    let frameB = 0;
    const frameA = requestAnimationFrame(() => {
      frameB = requestAnimationFrame(() => setMountedIn(true));
    });
    return () => {
      cancelAnimationFrame(frameA);
      cancelAnimationFrame(frameB);
    };
  }, [reducedMotion, trigger]);

  const visible =
    trigger === "mount" ? reducedMotion || mountedIn : inView;

  return (
    <Tag
      ref={ref as never}
      className={cn(revealClass(visible), className)}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      data-reveal-trigger={trigger}
    >
      {children}
    </Tag>
  );
}
