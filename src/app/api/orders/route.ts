import { NextResponse } from "next/server";
import { MockAsterMdStorefrontService } from "@/lib/api/astermd/storefront-service";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    treatmentId?: string;
    planId?: string;
  } | null;

  if (!body?.treatmentId || !body.planId) {
    return NextResponse.json(
      { error: "treatmentId and planId are required" },
      { status: 400 },
    );
  }

  const order = await new MockAsterMdStorefrontService().createOrder({
    treatmentId: body.treatmentId,
    planId: body.planId,
  });

  return NextResponse.json({ data: order });
}
