import type { Patient } from "@/lib/domain/types";

export type AuthSession = {
  patient: Patient;
  createdAt: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  phone: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

/**
 * Mock auth abstraction. Replace with AsterMD / IdP session later.
 * Do not store secrets or PHI in localStorage from this layer.
 */
export interface AuthService {
  register(input: RegisterInput): Promise<AuthSession>;
  login(input: LoginInput): Promise<AuthSession>;
  logout(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
}

let memorySession: AuthSession | null = null;

export class MockAuthService implements AuthService {
  async register(input: RegisterInput): Promise<AuthSession> {
    await delay(250);
    memorySession = {
      patient: {
        id: `pat_${crypto.randomUUID().slice(0, 8)}`,
        email: input.email,
        phone: input.phone,
        firstName: "",
        lastName: "",
      },
      createdAt: new Date().toISOString(),
    };
    return memorySession;
  }

  async login(input: LoginInput): Promise<AuthSession> {
    await delay(250);
    memorySession = {
      patient: {
        id: "pat_demo_001",
        email: input.email,
        phone: "",
        firstName: "Alex",
        lastName: "Morgan",
      },
      createdAt: new Date().toISOString(),
    };
    return memorySession;
  }

  async logout(): Promise<void> {
    memorySession = null;
  }

  async getSession(): Promise<AuthSession | null> {
    return memorySession;
  }
}

export const authService: AuthService = new MockAuthService();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
