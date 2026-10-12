"use client";

import type { ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { revealClass } from "@/lib/motion/variants";
import { cn } from "@/lib/utils/cn";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delayMs?: number;
  once?: boolean;
};

export function Reveal({
  children,
  className,
  as: Tag = "div",
  delayMs = 0,
  once = true,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>({ once });

  return (
    <Tag
      ref={ref as never}
      className={cn(revealClass(inView), className)}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
