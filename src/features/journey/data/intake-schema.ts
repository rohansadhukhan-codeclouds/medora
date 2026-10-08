export type IntakeQuestionType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox";

export type IntakeQuestion = {
  id: string;
  type: IntakeQuestionType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  fullWidth?: boolean;
};

export type IntakeStepDefinition = {
  id: string;
  title: string;
  description: string;
  questions: IntakeQuestion[];
};

/**
 * Dynamic intake schema — later replaceable by AsterMD / JSON config.
 */
export const INTAKE_SCHEMA: IntakeStepDefinition[] = [
  {
    id: "personal",
    title: "Personal information",
    description: "Basic details for your care record.",
    questions: [
      { id: "firstName", type: "text", label: "First name", required: true },
      { id: "lastName", type: "text", label: "Last name", required: true },
      {
        id: "dateOfBirth",
        type: "text",
        label: "Date of birth (YYYY-MM-DD)",
        required: true,
      },
    ],
  },
  {
    id: "history",
    title: "Medical history",
    description: "Share relevant history for provider review.",
    questions: [
      {
        id: "conditions",
        type: "textarea",
        label: "Current or past medical conditions",
        placeholder: "List conditions or write None",
        required: true,
        fullWidth: true,
      },
    ],
  },
  {
    id: "medications",
    title: "Current medications",
    description: "Include prescriptions, OTC, and supplements.",
    questions: [
      {
        id: "medications",
        type: "textarea",
        label: "Current medications",
        placeholder: "List medications or write None",
        required: true,
        fullWidth: true,
      },
    ],
  },
  {
    id: "allergies",
    title: "Allergies",
    description: "Drug, food, or environmental allergies.",
    questions: [
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
    id: "treatment",
    title: "Treatment questions",
    description: "Pathway-specific questions (demo placeholders).",
    questions: [
      {
        id: "goals",
        type: "textarea",
        label: "What are your care goals?",
        required: true,
        fullWidth: true,
      },
      {
        id: "priorTreatment",
        type: "radio",
        label: "Have you tried related treatment before?",
        required: true,
        options: [
          { value: "no", label: "No" },
          { value: "yes", label: "Yes" },
        ],
      },
    ],
  },
  {
    id: "consent",
    title: "Consent",
    description: "Confirm you understand the care process.",
    questions: [
      {
        id: "consent",
        type: "radio",
        label: "I understand treatment is not guaranteed",
        required: true,
        options: [
          { value: "agree", label: "I understand and agree" },
          { value: "disagree", label: "I do not agree" },
        ],
      },
    ],
  },
  {
    id: "review",
    title: "Review & submit",
    description: "Confirm your answers before submission.",
    questions: [
      {
        id: "confirmAccurate",
        type: "radio",
        label: "I confirm the information provided is accurate",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
    ],
  },
];
