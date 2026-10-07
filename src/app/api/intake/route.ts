import { NextResponse } from "next/server";
import { getAsterMdClient } from "@/lib/api/astermd/client";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import { intakeFormSchema } from "@/features/intake/schemas/intake-schema";
import { requirePatientSession } from "@/lib/security/auth";

/**
 * BFF: Browser → Route Handler → AsterMD client
 * Never call AsterMD credentials from the browser.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = intakeFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your information and try again." },
        { status: 400 },
      );
    }

    const patientId = await requirePatientSession();
    const intake = await getAsterMdClient().createIntake({
      patientId,
      sections: Object.entries(parsed.data).map(([sectionId, values]) => ({
        sectionId,
        values,
      })),
    });

    return NextResponse.json({ data: intake }, { status: 201 });
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    return NextResponse.json(
      { error: getUserFacingMessage(normalized) },
      { status: normalized.status },
    );
  }
}
