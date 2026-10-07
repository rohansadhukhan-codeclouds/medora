import "server-only";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { MockAsterMdService } from "@/lib/api/astermd/mock-service";
import { RealAsterMdService } from "@/lib/api/astermd/real-service";
import type { AsterMdService } from "@/lib/api/astermd/service";

/**
 * Factory for the AsterMD service used by Server Actions / Route Handlers.
 * Browser code must never instantiate this client.
 */
let singleton: AsterMdService | null = null;

export function getAsterMdClient(): AsterMdService {
  if (singleton) {
    return singleton;
  }

  const config = getAsterMdConfig();
  singleton = config.useMock
    ? new MockAsterMdService()
    : new RealAsterMdService();

  return singleton;
}

/** Alias used by BFF layers for clarity */
export const asterMdClient = {
  get: getAsterMdClient,
};
