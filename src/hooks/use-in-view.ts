"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type UseInViewOptions = {
  once?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
  disabled?: boolean;
};

export function useInView<T extends Element = HTMLDivElement>(
  options: UseInViewOptions = {},
) {
  const {
    once = true,
    rootMargin = "0px 0px -8% 0px",
    threshold = 0.12,
    disabled = false,
  } = options;
  const ref = useRef<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [observed, setObserved] = useState(false);
  const skipObservation = disabled || reducedMotion;

  useEffect(() => {
    if (skipObservation) return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        // Observer callback is an external subscription — safe to set state.
        setObserved(true);
        if (once) observer.disconnect();
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, skipObservation, threshold]);

  return { ref, inView: skipObservation || observed };
}
