import { cn } from "@/lib/utils/cn";

/** CSS class tokens that map to globals.css motion utilities. */
const motionClass = {
  reveal: "motion-reveal",
  revealIn: "motion-reveal-in",
} as const;

export function revealClass(visible: boolean, className?: string) {
  return cn(motionClass.reveal, visible && motionClass.revealIn, className);
}
