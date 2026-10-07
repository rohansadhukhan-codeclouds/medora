import "server-only";
import { z } from "zod";

/**
 * Server-side environment validation.
 * AsterMD secrets must NEVER be exposed via NEXT_PUBLIC_* variables.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  ASTERMD_BASE_URL: z.string().url().optional(),
  ASTERMD_API_KEY: z.string().min(1).optional(),
  /**
   * When true (default in development), MockAsterMdService is used.
   * Set ASTERMD_USE_MOCK=false once real credentials and endpoints are ready.
   */
  ASTERMD_USE_MOCK: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function readServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    ASTERMD_BASE_URL: process.env.ASTERMD_BASE_URL || undefined,
    ASTERMD_API_KEY: process.env.ASTERMD_API_KEY || undefined,
    ASTERMD_USE_MOCK: process.env.ASTERMD_USE_MOCK ?? "true",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
  });

  if (!parsed.success) {
    console.error("Invalid server environment configuration", parsed.error.flatten());
    throw new Error("Invalid server environment configuration");
  }

  return parsed.data;
}

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cachedEnv) {
    cachedEnv = readServerEnv();
  }
  return cachedEnv;
}
