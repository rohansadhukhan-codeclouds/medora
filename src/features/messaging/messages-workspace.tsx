"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConversationList } from "@/features/messaging/conversation-list";
import { MessageComposer } from "@/features/messaging/message-composer";
import { MessageThread } from "@/features/messaging/message-thread";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation, Message } from "@/lib/api/astermd/types";

type MessagesWorkspaceProps = {
  initialConversations: Conversation[];
};

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const response = await fetch(`/api/messages?conversationId=${conversationId}`);
  const payload = (await response.json()) as {
    data?: Message[];
    error?: string;
  };
  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to load messages");
  }
  return payload.data ?? [];
}

async function postMessage(conversationId: string, body: string): Promise<Message> {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, body }),
  });
  const payload = (await response.json()) as {
    data?: Message;
    error?: string;
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.error ?? "Unable to send message");
  }
  return payload.data;
}

export function MessagesWorkspace({
  initialConversations,
}: MessagesWorkspaceProps) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id);
  const selectedConversation = useMemo(
    () => initialConversations.find((item) => item.id === selectedId),
    [initialConversations, selectedId],
  );

  const messagesQuery = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: () => fetchMessages(selectedId!),
    enabled: Boolean(selectedId),
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => postMessage(selectedId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["messages", selectedId] });
    },
  });

  if (initialConversations.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        description="When your care team starts a conversation, it will appear here."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
      <ConversationList
        conversations={initialConversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <div className="flex min-h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            {selectedConversation?.subject ?? "Conversation"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Architecture supports polling or WebSocket transport later.
          </p>
        </div>

        {messagesQuery.isLoading ? (
          <div className="space-y-3 p-4" aria-busy="true">
            <Skeleton className="h-16 w-2/3" />
            <Skeleton className="ml-auto h-16 w-1/2" />
            <Skeleton className="h-16 w-3/5" />
          </div>
        ) : null}

        {messagesQuery.isError ? (
          <div className="p-4">
            <ErrorState
              message={
                messagesQuery.error instanceof Error
                  ? messagesQuery.error.message
                  : "Unable to load messages."
              }
              onRetry={() => void messagesQuery.refetch()}
            />
          </div>
        ) : null}

        {messagesQuery.data ? (
          <MessageThread messages={messagesQuery.data} />
        ) : null}

        <MessageComposer
          disabled={!selectedId || sendMutation.isPending}
          onSend={async (body) => {
            await sendMutation.mutateAsync(body);
          }}
        />
      </div>
    </div>
  );
}
