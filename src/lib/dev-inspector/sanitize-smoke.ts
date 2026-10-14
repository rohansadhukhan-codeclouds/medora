/**
 * Run: npx tsx src/lib/dev-inspector/sanitize-smoke.ts
 */
import { maskId, sanitizeDebugData } from "@/lib/dev-inspector/sanitize";

const input = {
  authorization: "Bearer secret",
  email: "a@b.com",
  symptoms: "pain",
  nested: { client_secret: "x", ok: true },
  imageUrl: `data:image/avif;base64,${"A".repeat(500)}`,
  long: "x".repeat(3000),
  list: [{ token: "abc", label: "safe" }],
};

const out = sanitizeDebugData(input) as {
  authorization: string;
  email: string;
  symptoms: string;
  nested: { client_secret: string; ok: boolean };
  imageUrl: string;
  long: string;
  list: Array<{ token: string; label: string }>;
};

const checks: Array<[string, boolean]> = [
  ["auth redacted", out.authorization === "[REDACTED]"],
  ["email redacted", out.email === "[REDACTED]"],
  ["symptoms redacted", out.symptoms === "[REDACTED]"],
  ["nested secret", out.nested.client_secret === "[REDACTED]"],
  ["nested ok", out.nested.ok === true],
  ["base64 compact", out.imageUrl.startsWith("[BASE64_IMAGE:")],
  ["long truncated", out.long.includes("TRUNCATED")],
  ["list token", out.list[0].token === "[REDACTED]"],
  ["list label kept", out.list[0].label === "safe"],
  ["mask", Boolean(maskId("abcdefghijklmnop")?.includes("…"))],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed += 1;
}

if (failed > 0) process.exit(1);
