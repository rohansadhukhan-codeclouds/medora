/**
 * Medora motion language — calm health-tech polish.
 * Prefer transform/opacity. Keep interactions under ~320ms.
 */

export const motionDuration = {
  fast: 150,
  normal: 260,
  emphasis: 400,
  reveal: 560,
} as const;

export const motionEase = {
  /** UI controls, buttons, focus */
  standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  /** Soft content fades */
  smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** Slightly expressive entrances */
  expressive: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const motionDistance = {
  micro: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const motionStagger = {
  tight: 55,
  normal: 75,
  loose: 95,
} as const;

export type MotionDurationKey = keyof typeof motionDuration;
export type MotionEaseKey = keyof typeof motionEase;
