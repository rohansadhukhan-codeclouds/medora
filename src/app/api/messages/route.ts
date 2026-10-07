import { NextResponse } from "next/server";
import { z } from "zod";
import { getAsterMdClient } from "@/lib/api/astermd/client";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import { requirePatientSession } from "@/lib/security/auth";

const sendSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().min(1).max(4000),
});

export async function GET(request: Request) {
  try {
    await requirePatientSession();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation is required." },
        { status: 400 },
      );
    }

    const messages = await getAsterMdClient().getMessages(conversationId);
    return NextResponse.json({ data: messages });
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    return NextResponse.json(
      { error: getUserFacingMessage(normalized) },
      { status: normalized.status },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requirePatientSession();
    const json = await request.json();
    const parsed = sendSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your information and try again." },
        { status: 400 },
      );
    }

    const message = await getAsterMdClient().sendMessage(parsed.data);
    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    const normalized = normalizeAsterMdError(error);
    return NextResponse.json(
      { error: getUserFacingMessage(normalized) },
      { status: normalized.status },
    );
  }
}
