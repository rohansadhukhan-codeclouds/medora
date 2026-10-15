"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  COUNTRY_DIAL_CODES,
  DEFAULT_PHONE_COUNTRY_ISO,
  findCountryByIso,
  flagEmoji,
  formatDialPrefix,
  type CountryDialCode,
} from "@/features/intake/data/country-dial-codes";
import { phoneCountryIsoKey } from "@/features/intake/teleform/field-meta";
import { FieldShell } from "@/features/intake/teleform/fields/field-shell";
import type { NormalizedTeleformField } from "@/features/intake/teleform/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  field: NormalizedTeleformField;
  value: string;
  countryIso: string;
  error?: string;
  onChange: (name: string, value: string | boolean | string[]) => void;
};

export function PhoneCountryTeleformField({
  field,
  value,
  countryIso,
  error,
  onChange,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const countryKey = phoneCountryIsoKey(field.name);

  const selected =
    findCountryByIso(countryIso) ??
    findCountryByIso(DEFAULT_PHONE_COUNTRY_ISO)!;

  useEffect(() => {
    if (!countryIso) {
      onChange(countryKey, DEFAULT_PHONE_COUNTRY_ISO);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once when empty
  }, [countryIso, countryKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_DIAL_CODES;
    return COUNTRY_DIAL_CODES.filter((country) => {
      const dial = formatDialPrefix(country.dial);
      return (
        country.name.toLowerCase().includes(q) ||
        country.iso2.toLowerCase().includes(q) ||
        dial.includes(q) ||
        country.dial.includes(q.replace(/^\+/, ""))
      );
    });
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  const pick = (country: CountryDialCode) => {
    onChange(countryKey, country.iso2);
    setOpen(false);
    setQuery("");
  };

  return (
    <FieldShell
      id={field.id}
      label={field.label}
      required={field.required}
      description={field.description}
      error={error}
      fullWidth={field.fullWidth}
      cols={field.meta?.cols}
    >
      <div ref={rootRef} className="relative">
        <div
          className={cn(
            "flex h-11 overflow-hidden rounded-lg border border-input bg-card",
            error && "border-destructive",
          )}
        >
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={`Country code ${formatDialPrefix(selected.dial)}, ${selected.name}`}
            onClick={() => setOpen((prev) => !prev)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-r border-input px-2.5",
              "text-sm text-foreground outline-none transition-colors",
              "hover:bg-accent/60",
            )}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {flagEmoji(selected.iso2)}
            </span>
            <span className="min-w-[2.75rem] font-medium tabular-nums">
              {formatDialPrefix(selected.dial)}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>

          <Input
            id={field.id}
            name={field.name}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={field.placeholder || "Mobile number"}
            value={value}
            required={field.required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${field.id}-error` : undefined}
            className="h-full rounded-none border-0 bg-transparent shadow-none focus:border-0 focus-visible:border-0"
            onChange={(event) => onChange(field.name, event.target.value)}
          />
        </div>

        {open ? (
          <div
            id={listId}
            role="listbox"
            aria-label="Select country calling code"
            className={cn(
              "absolute top-[calc(100%+0.4rem)] left-0 z-40 w-full min-w-[18rem] overflow-hidden",
              "rounded-xl border border-border bg-card shadow-lg sm:w-[22rem]",
            )}
          >
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search country or code"
                  className="h-9 border-input bg-background pl-8"
                  aria-label="Search countries"
                />
              </div>
            </div>
            <ul className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No countries found
                </li>
              ) : (
                filtered.map((country) => {
                  const active = country.iso2 === selected.iso2;
                  return (
                    <li key={country.iso2}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => pick(country)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left text-sm",
                          "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                          active && "bg-primary/8 text-foreground",
                        )}
                      >
                        <span className="text-lg leading-none" aria-hidden="true">
                          {flagEmoji(country.iso2)}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {country.name}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {formatDialPrefix(country.dial)}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
