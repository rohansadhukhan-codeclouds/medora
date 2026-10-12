"use client";

import type { ElementType, ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { motionStagger } from "@/lib/motion/config";
import { cn } from "@/lib/utils/cn";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  once?: boolean;
};

export function Stagger({
  children,
  className,
  as: Tag = "div",
  once = true,
}: StaggerProps) {
  const { ref, inView } = useInView<HTMLElement>({ once });

  return (
    <Tag
      ref={ref as never}
      data-stagger-visible={inView ? "true" : "false"}
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
