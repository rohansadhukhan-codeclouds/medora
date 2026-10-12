import { cn } from "@/lib/utils/cn";

/** CSS class tokens that map to globals.css motion utilities. */
export const motionClass = {
  reveal: "motion-reveal",
  revealIn: "motion-reveal-in",
  heroItem: "motion-hero-item",
  heroReady: "motion-hero-ready",
  staggerItem: "motion-stagger-item",
  staggerIn: "motion-stagger-in",
  cardLift: "motion-card-lift",
  imageZoom: "motion-image-zoom",
  linkUnderline: "motion-link-underline",
  navLink: "motion-nav-link",
  pressable: "motion-pressable",
} as const;

export function revealClass(visible: boolean, className?: string) {
  return cn(motionClass.reveal, visible && motionClass.revealIn, className);
}

export function staggerItemClass(visible: boolean, className?: string) {
  return cn(
    motionClass.staggerItem,
    visible && motionClass.staggerIn,
    className,
  );
}
