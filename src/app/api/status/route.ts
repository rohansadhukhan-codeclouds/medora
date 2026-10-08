import { NextResponse } from "next/server";
import { MockAsterMdStorefrontService } from "@/lib/api/astermd/storefront-service";

export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get("orderId") ?? "demo";
  const status = await new MockAsterMdStorefrontService().getTreatmentStatus(
    orderId,
  );
  return NextResponse.json({ data: { orderId, status } });
}
