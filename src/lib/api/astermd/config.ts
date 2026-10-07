import "server-only";
import { getServerEnv } from "@/lib/env";

export type AsterMdConfig = {
  baseUrl: string | undefined;
  apiKey: string | undefined;
  useMock: boolean;
  timeoutMs: number;
};

export function getAsterMdConfig(): AsterMdConfig {
  const env = getServerEnv();

  return {
    baseUrl: env.ASTERMD_BASE_URL,
    apiKey: env.ASTERMD_API_KEY,
    useMock: env.ASTERMD_USE_MOCK || !env.ASTERMD_API_KEY || !env.ASTERMD_BASE_URL,
    timeoutMs: 15_000,
  };
}
