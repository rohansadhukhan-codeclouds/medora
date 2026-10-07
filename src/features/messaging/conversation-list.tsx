"use client";

import { cn } from "@/lib/utils/cn";
import type { Conversation } from "@/lib/api/astermd/types";
import { formatDateTime } from "@/lib/utils/format";

type ConversationListProps = {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {conversations.map((conversation) => {
        const selected = conversation.id === selectedId;
        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "flex w-full flex-col gap-1 px-4 py-4 text-left transition-colors hover:bg-accent",
                selected && "bg-primary-muted",
              )}
              aria-current={selected ? "true" : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                  {conversation.subject}
                </span>
                {conversation.unreadCount > 0 ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {conversation.unreadCount}
                  </span>
                ) : null}
              </div>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {conversation.lastMessagePreview}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(conversation.lastMessageAt)}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
