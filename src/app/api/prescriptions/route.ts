import { NextResponse } from "next/server";
import { getAsterMdClient } from "@/lib/api/astermd/client";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import { requirePatientSession } from "@/lib/security/auth";

export async function GET() {
  try {
    const patientId = await requirePatientSession();
    const prescriptions = await getAsterMdClient().getPrescriptions(patientId);
    return NextResponse.json({ data: prescriptions });
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    return NextResponse.json(
      { error: getUserFacingMessage(normalized) },
      { status: normalized.status },
    );
  }
}
