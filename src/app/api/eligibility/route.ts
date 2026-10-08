import { NextResponse } from "next/server";
import { MockAsterMdStorefrontService } from "@/lib/api/astermd/storefront-service";
import {
  evaluateEligibility,
} from "@/features/care-flow/data/eligibility";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    treatmentId?: string;
    answers?: Record<string, string>;
  } | null;

  if (!body?.treatmentId || !body.answers) {
    return NextResponse.json(
      { error: "treatmentId and answers are required" },
      { status: 400 },
    );
  }

  const mapped = evaluateEligibility(body.answers);
  const status =
    mapped === "eligible"
      ? "eligible"
      : mapped === "unavailable_state"
        ? "unavailable_state"
        : "ineligible";

  // BFF uses mock storefront service until AsterMD documents eligibility APIs.
  await new MockAsterMdStorefrontService().submitEligibility({
    treatmentId: body.treatmentId,
    answers: body.answers,
  });

  return NextResponse.json({
    data: {
      status,
      reasons:
        status === "eligible"
          ? undefined
          : ["Preliminary screening did not pass"],
    },
  });
}
