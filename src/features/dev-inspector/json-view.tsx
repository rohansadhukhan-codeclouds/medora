"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  value: unknown;
  defaultOpen?: boolean;
};

export function JsonView({ label, value, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => {
    try {
      return JSON.stringify(value ?? null, null, 2);
    } catch {
      return '"[Unserializable]"';
    }
  }, [value]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          className="text-left text-sm font-medium text-foreground"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? "▾" : "▸"} {label}
        </button>
        <Button type="button" size="sm" variant="ghost" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      {open ? (
        <pre
          className={cn(
            "max-h-56 overflow-auto border-t border-border px-3 py-2",
            "whitespace-pre-wrap break-words text-xs text-muted-foreground",
          )}
        >
          {text}
        </pre>
      ) : null}
    </div>
  );
}
