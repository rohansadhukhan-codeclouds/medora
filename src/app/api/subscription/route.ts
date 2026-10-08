import { NextResponse } from "next/server";
import { MockAsterMdStorefrontService } from "@/lib/api/astermd/storefront-service";

export async function GET() {
  const subscription =
    await new MockAsterMdStorefrontService().getSubscription("pat_demo");
  return NextResponse.json({ data: subscription });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const updated = await new MockAsterMdStorefrontService().updateSubscription(
    "sub_demo",
    body,
  );
  return NextResponse.json({ data: updated });
}
