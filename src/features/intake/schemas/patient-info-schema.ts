import { z } from "zod";

/**
 * Contact / identity fields collected after teleform answers.
 * Live AsterMD opportunity / verification APIs are PENDING — this is UI draft only.
 */
export const patientInfoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  name: z.string().min(1, "Name is required"),
  // Format/validity comes from AsterMD email-verify after debounce — don't block typing.
  email: z.string().min(1, "Email is required"),
  address: z.string().min(1, "Address is required"),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .max(32, "Phone number is too long"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
});

export type PatientInfoValues = z.infer<typeof patientInfoSchema>;

export const PATIENT_TITLE_OPTIONS = [
  "Mr",
  "Mrs",
  "Ms",
  "Miss",
  "Dr",
  "Mx",
  "Prefer not to say",
] as const;

export const emptyPatientInfoValues: PatientInfoValues = {
  title: "",
  name: "",
  email: "",
  address: "",
  phone: "",
  dateOfBirth: "",
};
