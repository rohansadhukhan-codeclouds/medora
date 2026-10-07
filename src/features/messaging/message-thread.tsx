import { MessageBubble } from "@/features/messaging/message-bubble";
import { EmptyState } from "@/components/shared/empty-state";
import type { Message } from "@/lib/api/astermd/types";

type MessageThreadProps = {
  messages: Message[];
};

export function MessageThread({ messages }: MessageThreadProps) {
  if (messages.length === 0) {
    return (
      <EmptyState
        className="border-0 shadow-none"
        title="No messages yet"
        description="Start the conversation with your care team."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
