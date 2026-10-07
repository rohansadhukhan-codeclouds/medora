"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessageComposerProps = {
  disabled?: boolean;
  onSend: (body: string) => Promise<void> | void;
};

export function MessageComposer({ disabled, onSend }: MessageComposerProps) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setBody("");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-border p-4">
      <label htmlFor="message-body" className="sr-only">
        Message
      </label>
      <Textarea
        id="message-body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write a message to your care team…"
        disabled={disabled || sending}
        rows={3}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || sending || !body.trim()}>
          <Send />
          {sending ? "Sending…" : "Send"}
        </Button>
      </div>
    </form>
  );
}
