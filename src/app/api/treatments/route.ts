import { NextResponse } from "next/server";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import {
  MockAsterMdStorefrontService,
  RealAsterMdStorefrontService,
} from "@/lib/api/astermd/storefront-service";

export async function GET() {
  try {
    const config = getAsterMdConfig();
    const service = config.useMock
      ? new MockAsterMdStorefrontService()
      : new RealAsterMdStorefrontService();
    const treatments = await service.getTreatments();
    return NextResponse.json({ data: treatments });
  } catch {
    // Fall back to mock catalog if real service is not wired yet.
    const treatments = await new MockAsterMdStorefrontService().getTreatments();
    return NextResponse.json({ data: treatments, fallback: true });
  }
}
