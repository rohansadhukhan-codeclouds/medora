import { z } from "zod";

/**
 * Placeholder intake schema for UI architecture.
 * Replace/extend with product + AsterMD questionnaire requirements later.
 * Designed so sections can be driven from JSON/API config in the future.
 */

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  sexAtBirth: z.string().min(1, "Please select an option"),
});

export const contactInfoSchema = z.object({
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  addressLine1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "ZIP code is required"),
});

export const medicalHistorySchema = z.object({
  conditions: z.string().optional(),
  priorSurgeries: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export const medicationsSchema = z.object({
  currentMedications: z.string().optional(),
  none: z.boolean().optional(),
});

export const allergiesSchema = z.object({
  allergies: z.string().optional(),
  noKnownAllergies: z.boolean().optional(),
});

export const healthQuestionsSchema = z.object({
  primaryConcern: z.string().min(1, "Please describe your primary concern"),
  symptomDuration: z.string().min(1, "Please share how long this has been going on"),
});

export const consentSchema = z.object({
  telehealthConsent: z
    .boolean()
    .refine((value) => value === true, {
      message: "Telehealth consent is required",
    }),
  privacyAcknowledgement: z
    .boolean()
    .refine((value) => value === true, {
      message: "Privacy acknowledgement is required",
    }),
  accuracyAcknowledgement: z
    .boolean()
    .refine((value) => value === true, {
      message: "Accuracy acknowledgement is required",
    }),
});

export const intakeFormSchema = z.object({
  personal: personalInfoSchema,
  contact: contactInfoSchema,
  medicalHistory: medicalHistorySchema,
  medications: medicationsSchema,
  allergies: allergiesSchema,
  healthQuestions: healthQuestionsSchema,
  consent: consentSchema,
});

export type IntakeFormValues = z.infer<typeof intakeFormSchema>;

export const INTAKE_STEPS = [
  { id: "personal", title: "Personal information", schema: personalInfoSchema },
  { id: "contact", title: "Contact information", schema: contactInfoSchema },
  { id: "medicalHistory", title: "Medical history", schema: medicalHistorySchema },
  { id: "medications", title: "Current medications", schema: medicationsSchema },
  { id: "allergies", title: "Allergies", schema: allergiesSchema },
  { id: "healthQuestions", title: "Health questions", schema: healthQuestionsSchema },
  { id: "consent", title: "Consent", schema: consentSchema },
  { id: "review", title: "Review & submit", schema: z.object({}) },
] as const;

export type IntakeStepId = (typeof INTAKE_STEPS)[number]["id"];

export const defaultIntakeValues: IntakeFormValues = {
  personal: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sexAtBirth: "",
  },
  contact: {
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
  },
  medicalHistory: {
    conditions: "",
    priorSurgeries: "",
    additionalNotes: "",
  },
  medications: {
    currentMedications: "",
    none: false,
  },
  allergies: {
    allergies: "",
    noKnownAllergies: false,
  },
  healthQuestions: {
    primaryConcern: "",
    symptomDuration: "",
  },
  consent: {
    telehealthConsent: false,
    privacyAcknowledgement: false,
    accuracyAcknowledgement: false,
  },
};
