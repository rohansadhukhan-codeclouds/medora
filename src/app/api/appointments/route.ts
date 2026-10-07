import { NextResponse } from "next/server";
import { getAsterMdClient } from "@/lib/api/astermd/client";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import { requirePatientSession } from "@/lib/security/auth";

export async function GET() {
  try {
    const patientId = await requirePatientSession();
    const appointments = await getAsterMdClient().getAppointments(patientId);
    return NextResponse.json({ data: appointments });
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    return NextResponse.json(
      { error: getUserFacingMessage(normalized) },
      { status: normalized.status },
    );
  }
}
