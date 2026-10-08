import type { QuestionOption } from "@/features/care-flow/types";

/** Demo-only unsupported states for static eligibility UI. */
export const UNSUPPORTED_STATES = new Set(["AK", "HI"]);

export const US_STATES: QuestionOption[] = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "IL", label: "Illinois" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
  { value: "WA", label: "Washington" },
];

export const ELIGIBILITY_STEPS = [
  {
    id: "age",
    title: "What is your age?",
    description: "We use this only for a preliminary eligibility check.",
    type: "select" as const,
    options: [
      { value: "under_18", label: "Under 18" },
      { value: "18_24", label: "18–24" },
      { value: "25_44", label: "25–44" },
      { value: "45_64", label: "45–64" },
      { value: "65_plus", label: "65+" },
    ],
  },
  {
    id: "state",
    title: "Which state do you live in?",
    description: "Care availability can vary by state.",
    type: "select" as const,
    options: US_STATES,
  },
  {
    id: "pregnant",
    title: "Are you pregnant or breastfeeding?",
    description: "Please select the option that best applies.",
    type: "radio" as const,
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
      { value: "na", label: "Not applicable" },
    ],
  },
  {
    id: "conditions",
    title: "Do you have any listed medical conditions?",
    description: "This is a preliminary screening question only.",
    type: "radio" as const,
    options: [
      { value: "none", label: "None of the listed conditions" },
      { value: "listed", label: "Yes, one or more listed conditions" },
      { value: "unsure", label: "I'm not sure" },
    ],
  },
  {
    id: "medications",
    title: "Are you currently taking any medications?",
    description: "Your provider will review details later in intake.",
    type: "radio" as const,
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
  },
] as const;

/**
 * Simple demo conditions — not medical decision logic.
 * under_18, unsupported state, pregnant=yes, listed conditions → block.
 */
export function evaluateEligibility(
  answers: Record<string, string>,
): "eligible" | "unavailable_state" | "not_suitable" {
  if (answers.state && UNSUPPORTED_STATES.has(answers.state)) {
    return "unavailable_state";
  }
  if (answers.age === "under_18") {
    return "not_suitable";
  }
  if (answers.pregnant === "yes") {
    return "not_suitable";
  }
  if (answers.conditions === "listed") {
    return "not_suitable";
  }
  return "eligible";
}
