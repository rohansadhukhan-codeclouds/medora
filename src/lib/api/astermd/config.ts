import "server-only";
import { getServerEnv, type AppEnv, type ServerEnv } from "@/lib/env";

export type AsterMdCredentials = {
  baseUrl: string | undefined;
  clientId: string | undefined;
  clientSecret: string | undefined;
  channelId: string | undefined;
  apiKey: string | undefined;
};

export type AsterMdConfig = AsterMdCredentials & {
  appEnv: AppEnv;
  useMock: boolean;
  timeoutMs: number;
};

/**
 * Resolve AsterMD credentials for the active APP_ENV.
 * APP_ENV=dev  → ASTERMD_DEV_*
 * APP_ENV=prod → ASTERMD_PROD_*
 */
export function resolveAsterMdCredentials(
  env: ServerEnv = getServerEnv(),
): AsterMdCredentials {
  if (env.APP_ENV === "prod") {
    return {
      baseUrl: env.ASTERMD_PROD_BASE_URL,
      clientId: env.ASTERMD_PROD_CLIENT_ID,
      clientSecret: env.ASTERMD_PROD_CLIENT_SECRET,
      channelId: env.ASTERMD_PROD_CHANNEL_ID,
      apiKey: env.ASTERMD_PROD_API_KEY,
    };
  }

  return {
    baseUrl: env.ASTERMD_DEV_BASE_URL,
    clientId: env.ASTERMD_DEV_CLIENT_ID,
    clientSecret: env.ASTERMD_DEV_CLIENT_SECRET,
    channelId: env.ASTERMD_DEV_CHANNEL_ID,
    apiKey: env.ASTERMD_DEV_API_KEY,
  };
}

export function getAsterMdConfig(): AsterMdConfig {
  const env = getServerEnv();
  const credentials = resolveAsterMdCredentials(env);
  const hasRequiredConnection =
    Boolean(credentials.baseUrl) &&
    Boolean(credentials.clientId) &&
    Boolean(credentials.clientSecret) &&
    Boolean(credentials.channelId);

  return {
    appEnv: env.APP_ENV,
    ...credentials,
    useMock: env.ASTERMD_USE_MOCK || !hasRequiredConnection,
    timeoutMs: 15_000,
  };
}
