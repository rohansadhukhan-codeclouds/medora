"use server";

import { getAsterMdClient } from "@/lib/api/astermd/client";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import {
  intakeFormSchema,
  type IntakeFormValues,
} from "@/features/intake/schemas/intake-schema";
import { requirePatientSession } from "@/lib/security/auth";

export type SubmitIntakeResult =
  | { ok: true; intakeId: string }
  | { ok: false; message: string };

export async function submitIntakeAction(
  values: IntakeFormValues,
): Promise<SubmitIntakeResult> {
  const parsed = intakeFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check your information and try again.",
    };
  }

  try {
    const patientId = await requirePatientSession();
    const client = getAsterMdClient();

    const intake = await client.createIntake({
      patientId,
      sections: [
        { sectionId: "personal", values: parsed.data.personal },
        { sectionId: "contact", values: parsed.data.contact },
        { sectionId: "medicalHistory", values: parsed.data.medicalHistory },
        { sectionId: "medications", values: parsed.data.medications },
        { sectionId: "allergies", values: parsed.data.allergies },
        { sectionId: "healthQuestions", values: parsed.data.healthQuestions },
        { sectionId: "consent", values: parsed.data.consent },
      ],
    });

    return { ok: true, intakeId: intake.id };
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    return { ok: false, message: getUserFacingMessage(normalized) };
  }
}
