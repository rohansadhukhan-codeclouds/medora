import { cn } from "@/lib/utils/cn";
import type { Message } from "@/lib/api/astermd/types";
import { formatDateTime } from "@/lib/utils/format";

type MessageBubbleProps = {
  message: Message;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isPatient = message.sender === "patient";

  return (
    <div
      className={cn("flex w-full", isPatient ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
          isPatient
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        <p>{message.body}</p>
        <p
          className={cn(
            "mt-2 text-[11px]",
            isPatient ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {formatDateTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
