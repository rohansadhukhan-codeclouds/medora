import { NextResponse } from "next/server";

/**
 * BFF placeholder for intake submission.
 * Persists nothing yet — wire to AsterMdService.createIntake when docs exist.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    answers?: Record<string, string | string[]>;
  } | null;

  if (!body?.answers) {
    return NextResponse.json({ error: "answers are required" }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      id: `intake_${crypto.randomUUID().slice(0, 8)}`,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    },
  });
}
