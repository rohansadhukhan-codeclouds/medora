import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { MessagesWorkspace } from "@/features/messaging/messages-workspace";
import { getAsterMdClient } from "@/lib/api/astermd/client";
import { getUserFacingMessage, normalizeAsterMdError } from "@/lib/api/astermd/errors";
import type { Conversation } from "@/lib/api/astermd/types";
import { requirePatientSession } from "@/lib/security/auth";

async function loadConversations(): Promise<
  { ok: true; data: Conversation[] } | { ok: false; message: string }
> {
  try {
    const patientId = await requirePatientSession();
    const data = await getAsterMdClient().getConversations(patientId);
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: getUserFacingMessage(normalizeAsterMdError(error)),
    };
  }
}

export async function MessagesView() {
  const result = await loadConversations();

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <PageHeader title="Messages" />
        <ErrorState message={result.message} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Messages"
        description="Secure messaging with your care team. Realtime transport can be added later without changing this UI."
      />
      <MessagesWorkspace initialConversations={result.data} />
    </div>
  );
}
