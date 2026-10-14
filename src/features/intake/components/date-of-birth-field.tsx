"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import "react-day-picker/style.css";

type Props = {
  id?: string;
  label?: string;
  value: string;
  error?: string;
  onChange: (isoDate: string) => void;
  onBlur?: () => void;
  className?: string;
};

function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function parseValue(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

export function DateOfBirthField({
  id = "patient-dateOfBirth",
  label = "Date of birth",
  value,
  error,
  onChange,
  onBlur,
  className,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected = parseValue(value);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);
  const startMonth = useMemo(() => new Date(1920, 0), []);
  const endMonth = useMemo(() => new Date(), []);
  const defaultMonth = selected ?? new Date(1995, 0, 1);

  const display = selected
    ? format(selected, "MMMM d, yyyy")
    : "Select date of birth";

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onBlur]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={id}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={Boolean(error)}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-card px-3 text-left text-sm",
            "outline-none focus:outline-none focus-visible:outline-none",
            !selected && "text-muted-foreground",
            error && "border-destructive",
          )}
        >
          <CalendarDays
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate">{display}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>

        {open ? (
          <div
            id={listId}
            role="dialog"
            aria-label="Choose date of birth"
            className={cn(
              "absolute top-[calc(100%+0.4rem)] right-0 z-40 w-[min(100%,20.5rem)]",
              "rounded-2xl border border-border bg-card p-3 shadow-lg",
            )}
          >
            <DayPicker
              mode="single"
              selected={selected}
              defaultMonth={defaultMonth}
              startMonth={startMonth}
              endMonth={endMonth}
              disabled={{ after: today }}
              captionLayout="dropdown"
              navLayout="around"
              animate
              onSelect={(date) => {
                if (!date) return;
                onChange(toIsoDate(date));
                setOpen(false);
                onBlur?.();
              }}
              className="medora-dob-picker mx-auto"
            />
            <p className="mt-2 px-1 text-[11px] text-muted-foreground">
              Use the month and year menus to jump quickly.
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
