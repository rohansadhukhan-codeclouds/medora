"use client";

import { useEffect, useState, type ElementType, type ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { motionStagger } from "@/lib/motion/config";
import { cn } from "@/lib/utils/cn";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  once?: boolean;
  /** `mount` = animate on first paint (above-the-fold lists like cart). */
  trigger?: "view" | "mount";
};

export function Stagger({
  children,
  className,
  as: Tag = "div",
  once = true,
  trigger = "view",
}: StaggerProps) {
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
      data-stagger-visible={visible ? "true" : "false"}
      className={cn("motion-stagger", className)}
    >
      {children}
    </Tag>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  index?: number;
};

export function StaggerItem({
  children,
  className,
  as: Tag = "div",
  index = 0,
}: StaggerItemProps) {
  return (
    <Tag
      className={cn("motion-stagger-item", className)}
      style={{ transitionDelay: `${index * motionStagger.normal}ms` }}
      data-stagger-index={index}
    >
      {children}
    </Tag>
  );
}
