import type { IntakeStepDefinition } from "@/features/care-flow/types";

/**
 * Static intake schema for UI architecture.
 * Later this can be replaced by AsterMD / Teleform JSON.
 */
export const MEDICAL_INTAKE_STEPS: IntakeStepDefinition[] = [
  {
    id: "personal",
    title: "Personal information",
    description: "Basic details for your care record.",
    questions: [
      {
        id: "firstName",
        type: "text",
        label: "First name",
        required: true,
      },
      {
        id: "lastName",
        type: "text",
        label: "Last name",
        required: true,
      },
      {
        id: "dateOfBirth",
        type: "date",
        label: "Date of birth",
        required: true,
      },
      {
        id: "gender",
        type: "select",
        label: "Gender",
        required: true,
        options: [
          { value: "female", label: "Female" },
          { value: "male", label: "Male" },
          { value: "non_binary", label: "Non-binary" },
          { value: "prefer_not", label: "Prefer not to say" },
        ],
      },
    ],
  },
  {
    id: "health",
    title: "Health information",
    description: "Help your provider understand your current health profile.",
    questions: [
      {
        id: "height",
        type: "text",
        label: "Height",
        placeholder: "e.g., 5'7\"",
        required: true,
      },
      {
        id: "weight",
        type: "text",
        label: "Weight",
        placeholder: "e.g., 180 lbs",
        required: true,
      },
      {
        id: "medications",
        type: "textarea",
        label: "Current medications",
        placeholder: "List medications or write None",
        required: true,
        fullWidth: true,
      },
      {
        id: "allergies",
        type: "textarea",
        label: "Allergies",
        placeholder: "List allergies or write None",
        required: true,
        fullWidth: true,
      },
    ],
  },
  {
    id: "history",
    title: "Medical history",
    description: "Multiple-choice questions for preliminary context only.",
    questions: [
      {
        id: "priorWeightProgram",
        type: "radio",
        label: "Have you participated in a weight management program before?",
        required: true,
        fullWidth: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
      {
        id: "goals",
        type: "checkbox",
        label: "What are your primary goals? (select all that apply)",
        required: true,
        fullWidth: true,
        options: [
          { value: "lose_weight", label: "Lose weight" },
          { value: "improve_energy", label: "Improve energy" },
          { value: "support_habits", label: "Build healthier habits" },
          { value: "provider_guidance", label: "Get provider guidance" },
        ],
      },
      {
        id: "concernNotes",
        type: "textarea",
        label: "Anything else you want your provider to know?",
        fullWidth: true,
      },
    ],
  },
];
