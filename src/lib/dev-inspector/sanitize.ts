import { MAX_DEBUG_STRING_LENGTH } from "@/lib/dev-inspector/types";

const SENSITIVE_KEYS = new Set(
  [
    "authorization",
    "token",
    "access_token",
    "refresh_token",
    "bearer",
    "client_secret",
    "clientsecret",
    "secret",
    "api_key",
    "apikey",
    "password",
    "cookie",
    "set-cookie",
    "jwt",
    "ssn",
    "social_security_number",
    "card_number",
    "cvv",
    "cvc",
    "pan",
    "stripe_secret",
    "webhook_secret",
    "email",
    "phone",
    "mobile",
    "telephone",
    "first_name",
    "lastname",
    "last_name",
    "full_name",
    "fullname",
    "dob",
    "date_of_birth",
    "address",
    "street",
    "zip",
    "postal_code",
    "medical_history",
    "medications",
    "symptoms",
    "diagnosis",
    "health",
    "answers",
    "intake",
    "questionnaire",
    "formjson",
    "form_json",
  ].map((k) => k.toLowerCase()),
);

const SENSITIVE_KEY_RE =
  /(secret|token|password|authorization|bearer|cookie|ssn|card|cvv|cvc|pan|email|phone|dob|address|symptom|medication|medical|intake|answer)/i;

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (SENSITIVE_KEYS.has(normalized)) return true;
  return SENSITIVE_KEY_RE.test(key);
}

function compactString(value: string): string {
  const trimmed = value.trim();
  const dataUrl = trimmed.match(
    /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/,
  );
  if (dataUrl) {
    return `[BASE64_IMAGE: ${dataUrl[1]}, ${dataUrl[2].length} chars]`;
  }

  if (/^data:image\//i.test(trimmed) && trimmed.includes("base64,")) {
    const mime = trimmed.slice(5, trimmed.indexOf(";")) || "image/*";
    const b64 = trimmed.slice(trimmed.indexOf("base64,") + 7);
    return `[BASE64_IMAGE: ${mime}, ${b64.length} chars]`;
  }

  if (trimmed.length > MAX_DEBUG_STRING_LENGTH) {
    return `${trimmed.slice(0, 120)}… [TRUNCATED ${trimmed.length} chars]`;
  }

  return value;
}

/**
 * Deep-clone-safe sanitizer for DEV inspector payloads.
 * Never mutates the input. Caps recursion depth.
 */
export function sanitizeDebugData(
  value: unknown,
  depth = 0,
  seen?: WeakSet<object>,
): unknown {
  if (depth > 12) return "[MAX_DEPTH]";
  if (value === null || value === undefined) return value;

  if (typeof value === "string") return compactString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return String(value);
  if (typeof value === "symbol") return value.toString();
  if (typeof value === "function") return "[Function]";

  const tracker = seen ?? new WeakSet<object>();

  if (Array.isArray(value)) {
    if (tracker.has(value)) return "[Circular]";
    tracker.add(value);
    return value.map((item) => sanitizeDebugData(item, depth + 1, tracker));
  }

  if (typeof value === "object") {
    if (tracker.has(value)) return "[Circular]";
    tracker.add(value);

    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      if (isSensitiveKey(key)) {
        out[key] = "[REDACTED]";
        continue;
      }
      out[key] = sanitizeDebugData(nested, depth + 1, tracker);
    }
    return out;
  }

  return String(value);
}

export function maskId(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length <= 10) return `${trimmed.slice(0, 2)}…`;
  return `${trimmed.slice(0, 6)}…${trimmed.slice(-4)}`;
}

export function safeEndpointPath(path: string): string {
  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      const url = new URL(path);
      return url.pathname;
    }
  } catch {
    // fall through
  }
  const q = path.indexOf("?");
  return q >= 0 ? path.slice(0, q) : path;
}

export function safeErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return compactString(error);
  if (error instanceof Error) {
    return compactString(error.message || error.name || "Error");
  }
  if (typeof error === "object" && error !== null) {
    const record = error as { userMessage?: unknown; message?: unknown; code?: unknown };
    if (typeof record.userMessage === "string") return compactString(record.userMessage);
    if (typeof record.message === "string") return compactString(record.message);
    if (typeof record.code === "string") return record.code;
  }
  return "Request failed";
}
