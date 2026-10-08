import "server-only";
import { z } from "zod";

/**
 * Server-side environment validation.
 * AsterMD secrets must NEVER be exposed via NEXT_PUBLIC_* variables.
 */
export const appEnvSchema = z.enum(["dev", "prod"]);

const optionalNonEmpty = z.string().min(1).optional();

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  /**
   * App runtime target used to switch AsterMD credential sets.
   * dev  → ASTERMD_DEV_*
   * prod → ASTERMD_PROD_*
   */
  APP_ENV: appEnvSchema.default("dev"),

  // Development
  ASTERMD_DEV_BASE_URL: z.string().url().optional(),
  ASTERMD_DEV_CLIENT_ID: optionalNonEmpty,
  ASTERMD_DEV_CLIENT_SECRET: optionalNonEmpty,
  ASTERMD_DEV_CHANNEL_ID: optionalNonEmpty,
  ASTERMD_DEV_API_KEY: optionalNonEmpty,

  // Production
  ASTERMD_PROD_BASE_URL: z.string().url().optional(),
  ASTERMD_PROD_CLIENT_ID: optionalNonEmpty,
  ASTERMD_PROD_CLIENT_SECRET: optionalNonEmpty,
  ASTERMD_PROD_CHANNEL_ID: optionalNonEmpty,
  ASTERMD_PROD_API_KEY: optionalNonEmpty,

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

export type AppEnv = z.infer<typeof appEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function readServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV ?? "dev",

    ASTERMD_DEV_BASE_URL: process.env.ASTERMD_DEV_BASE_URL?.trim() || undefined,
    ASTERMD_DEV_CLIENT_ID: process.env.ASTERMD_DEV_CLIENT_ID?.trim() || undefined,
    ASTERMD_DEV_CLIENT_SECRET:
      process.env.ASTERMD_DEV_CLIENT_SECRET?.trim() || undefined,
    ASTERMD_DEV_CHANNEL_ID:
      process.env.ASTERMD_DEV_CHANNEL_ID?.trim() || undefined,
    ASTERMD_DEV_API_KEY: process.env.ASTERMD_DEV_API_KEY?.trim() || undefined,

    ASTERMD_PROD_BASE_URL:
      process.env.ASTERMD_PROD_BASE_URL?.trim() || undefined,
    ASTERMD_PROD_CLIENT_ID:
      process.env.ASTERMD_PROD_CLIENT_ID?.trim() || undefined,
    ASTERMD_PROD_CLIENT_SECRET:
      process.env.ASTERMD_PROD_CLIENT_SECRET?.trim() || undefined,
    ASTERMD_PROD_CHANNEL_ID:
      process.env.ASTERMD_PROD_CHANNEL_ID?.trim() || undefined,
    ASTERMD_PROD_API_KEY: process.env.ASTERMD_PROD_API_KEY?.trim() || undefined,

    ASTERMD_USE_MOCK: process.env.ASTERMD_USE_MOCK ?? "true",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
  });

  if (!parsed.success) {
    console.error(
      "Invalid server environment configuration",
      parsed.error.flatten(),
    );
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

export function isDevAppEnv(env: ServerEnv = getServerEnv()): boolean {
  return env.APP_ENV === "dev";
}

export function isProdAppEnv(env: ServerEnv = getServerEnv()): boolean {
  return env.APP_ENV === "prod";
}
