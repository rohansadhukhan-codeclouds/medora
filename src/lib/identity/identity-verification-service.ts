import type { VerificationStatus } from "@/lib/domain/types";

export type VerificationSession = {
  id: string;
  status: VerificationStatus;
  updatedAt: string;
};

/**
 * Identity verification abstraction (KYC/ID). No real vendor integration.
 */
export interface IdentityVerificationService {
  start(): Promise<VerificationSession>;
  getStatus(sessionId: string): Promise<VerificationSession | null>;
  markVerified(sessionId: string): Promise<VerificationSession>;
  markFailed(sessionId: string): Promise<VerificationSession>;
  requestRetry(sessionId: string): Promise<VerificationSession>;
}

const sessions = new Map<string, VerificationSession>();

export class MockIdentityVerificationService
  implements IdentityVerificationService
{
  async start(): Promise<VerificationSession> {
    await delay(200);
    const session: VerificationSession = {
      id: `idv_${crypto.randomUUID().slice(0, 8)}`,
      status: "in_progress",
      updatedAt: new Date().toISOString(),
    };
    sessions.set(session.id, session);
    return session;
  }

  async getStatus(sessionId: string): Promise<VerificationSession | null> {
    return sessions.get(sessionId) ?? null;
  }

  async markVerified(sessionId: string): Promise<VerificationSession> {
    return this.update(sessionId, "verified");
  }

  async markFailed(sessionId: string): Promise<VerificationSession> {
    return this.update(sessionId, "failed");
  }

  async requestRetry(sessionId: string): Promise<VerificationSession> {
    return this.update(sessionId, "retry_required");
  }

  private async update(
    sessionId: string,
    status: VerificationStatus,
  ): Promise<VerificationSession> {
    await delay(150);
    const current = sessions.get(sessionId);
    if (!current) {
      throw new Error(`Verification session ${sessionId} not found`);
    }
    const next = { ...current, status, updatedAt: new Date().toISOString() };
    sessions.set(sessionId, next);
    return next;
  }
}

export const identityVerificationService: IdentityVerificationService =
  new MockIdentityVerificationService();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
