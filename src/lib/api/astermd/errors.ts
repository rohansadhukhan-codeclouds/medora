/**
 * Centralized API / AsterMD error model.
 * Never surface raw third-party error payloads to end users.
 */

export type ApiErrorCode =
  | "unauthorized"
  | "validation_error"
  | "provider_unavailable"
  | "timeout"
  | "patient_not_found"
  | "not_found"
  | "unexpected";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly userMessage: string;
  readonly details?: unknown;

  constructor(options: {
    code: ApiErrorCode;
    status?: number;
    message: string;
    userMessage: string;
    details?: unknown;
  }) {
    super(options.message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status ?? statusForCode(options.code);
    this.userMessage = options.userMessage;
    this.details = options.details;
  }
}

export class AsterMdError extends ApiError {
  constructor(options: {
    code: ApiErrorCode;
    status?: number;
    message: string;
    userMessage: string;
    details?: unknown;
  }) {
    super(options);
    this.name = "AsterMdError";
  }
}

function statusForCode(code: ApiErrorCode): number {
  switch (code) {
    case "unauthorized":
      return 401;
    case "validation_error":
      return 400;
    case "patient_not_found":
    case "not_found":
      return 404;
    case "timeout":
      return 504;
    case "provider_unavailable":
      return 503;
    default:
      return 500;
  }
}

const USER_MESSAGES: Record<ApiErrorCode, string> = {
  unauthorized: "Please sign in to continue.",
  validation_error: "Please check your information and try again.",
  provider_unavailable:
    "Our care partner is temporarily unavailable. Please try again shortly.",
  timeout: "The request took too long. Please try again.",
  patient_not_found: "We could not find your patient record.",
  not_found: "The requested information could not be found.",
  unexpected: "Something went wrong. Please try again later.",
};

/**
 * Normalize unknown provider/network failures into safe ApiError instances.
 * Placeholder: map real AsterMD status codes/bodies here when docs arrive.
 */
export function normalizeAsterMdError(error: unknown): AsterMdError {
  if (error instanceof AsterMdError) {
    return error;
  }

  if (error instanceof ApiError) {
    return new AsterMdError({
      code: error.code,
      status: error.status,
      message: error.message,
      userMessage: error.userMessage,
      details: error.details,
    });
  }

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new AsterMdError({
      code: "timeout",
      message: "AsterMD request timed out",
      userMessage: USER_MESSAGES.timeout,
    });
  }

  if (error instanceof Error) {
    const lowered = error.message.toLowerCase();
    if (lowered.includes("timeout") || lowered.includes("aborted")) {
      return new AsterMdError({
        code: "timeout",
        message: error.message,
        userMessage: USER_MESSAGES.timeout,
      });
    }
  }

  return new AsterMdError({
    code: "unexpected",
    message: error instanceof Error ? error.message : "Unknown AsterMD error",
    userMessage: USER_MESSAGES.unexpected,
  });
}

export function getUserFacingMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.userMessage;
  }
  return USER_MESSAGES.unexpected;
}

export { USER_MESSAGES };
