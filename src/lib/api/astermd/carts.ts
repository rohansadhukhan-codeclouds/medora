import "server-only";
import type {
  AsterMdCartApiResponse,
  AsterMdCartLine,
  AsterMdCartRecord,
  CreateAsterMdCartBody,
  UpdateAsterMdCartBody,
} from "@/lib/api/astermd/cart-types";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import { ASTERMD_ENDPOINTS } from "@/lib/api/astermd/endpoints";
import { AsterMdError } from "@/lib/api/astermd/errors";
import { asterMdFetch } from "@/lib/api/astermd/http-client";

const globalState = globalThis as typeof globalThis & {
  __medoraMockCarts?: Map<string, AsterMdCartRecord>;
};

function mockCarts(): Map<string, AsterMdCartRecord> {
  if (!globalState.__medoraMockCarts) {
    globalState.__medoraMockCarts = new Map();
  }
  return globalState.__medoraMockCarts;
}

function assertSessionId(sessionId: string): string {
  const id = sessionId.trim();
  if (!id) {
    throw new AsterMdError({
      code: "validation_error",
      message: "AsterMD cart requires a session UUID",
      userMessage: "Your browsing session is missing. Please refresh the page.",
    });
  }
  return id;
}

function normalizeItems(items: AsterMdCartLine[]): AsterMdCartLine[] {
  return items
    .map((item) => ({
      product_id: String(item.product_id ?? "").trim(),
      name: String(item.name ?? "").trim(),
      qty: typeof item.qty === "number" && item.qty > 0 ? item.qty : 1,
    }))
    .filter((item) => item.product_id && item.name);
}

/**
 * POST /v1/sales/carts/create
 * Do NOT send channel_id — AsterMD derives it from the API credentials.
 */
export async function createSalesCart(input: {
  sessionId: string;
  items: AsterMdCartLine[];
}): Promise<AsterMdCartRecord> {
  const config = getAsterMdConfig();
  const sessionId = assertSessionId(input.sessionId);
  const items = normalizeItems(input.items);

  if (items.length === 0) {
    throw new AsterMdError({
      code: "validation_error",
      message: "AsterMD cart create requires at least one item",
      userMessage: "Add a product before creating a cart.",
    });
  }

  if (config.useMock) {
    const cart: AsterMdCartRecord = {
      _id: `mock-cart-${sessionId}`,
      session: sessionId,
      status: "initiated",
      items,
      channel_id: config.channelId,
    };
    mockCarts().set(sessionId, cart);
    return cart;
  }

  const body: CreateAsterMdCartBody = {
    session: sessionId,
    items,
  };

  const payload = await asterMdFetch<AsterMdCartApiResponse>({
    method: "POST",
    path: ASTERMD_ENDPOINTS.cartsCreate,
    body,
  });

  if (!payload.data) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "AsterMD cart create returned no data",
      userMessage: "Unable to create your cart. Please try again.",
      details: payload,
    });
  }

  return payload.data;
}

/**
 * Update cart by session UUID (path :id is the session, not cart _id).
 * Body must not include session.
 */
export async function updateSalesCart(input: {
  sessionId: string;
  items: AsterMdCartLine[];
}): Promise<AsterMdCartRecord> {
  const config = getAsterMdConfig();
  const sessionId = assertSessionId(input.sessionId);
  const items = normalizeItems(input.items);

  if (config.useMock) {
    const cart: AsterMdCartRecord = {
      _id: `mock-cart-${sessionId}`,
      session: sessionId,
      status: "initiated",
      items,
      channel_id: config.channelId,
    };
    mockCarts().set(sessionId, cart);
    return cart;
  }

  const body: UpdateAsterMdCartBody = { items };

  // AsterMD cart update is PUT /v1/sales/carts/update/{sessionUuid}.
  const payload = await asterMdFetch<AsterMdCartApiResponse>({
    method: "PUT",
    path: ASTERMD_ENDPOINTS.cartsUpdate(sessionId),
    body,
  });

  if (!payload.data) {
    throw new AsterMdError({
      code: "provider_unavailable",
      message: "AsterMD cart update returned no data",
      userMessage: "Unable to update your cart. Please try again.",
      details: payload,
    });
  }

  return payload.data;
}

/** GET /v1/sales/carts/view/{sessionUuid} */
export async function viewSalesCart(
  sessionId: string,
): Promise<AsterMdCartRecord | null> {
  const config = getAsterMdConfig();
  const id = assertSessionId(sessionId);

  if (config.useMock) {
    return mockCarts().get(id) ?? null;
  }

  try {
    const payload = await asterMdFetch<AsterMdCartApiResponse>({
      method: "GET",
      path: ASTERMD_ENDPOINTS.cartsView(id),
    });
    return payload.data ?? null;
  } catch (error) {
    if (error instanceof AsterMdError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Create if no cart for session; otherwise update with the full items list.
 */
export async function syncSalesCart(input: {
  sessionId: string;
  items: AsterMdCartLine[];
}): Promise<{
  cart: AsterMdCartRecord;
  created: boolean;
}> {
  const existing = await viewSalesCart(input.sessionId);

  if (!existing) {
    // Nothing to clear remotely; empty sync is a no-op when no cart exists.
    if (input.items.length === 0) {
      return {
        cart: {
          session: input.sessionId,
          items: [],
          status: "initiated",
        },
        created: false,
      };
    }
    const cart = await createSalesCart(input);
    return { cart, created: true };
  }

  // Existing cart — update with full list (including empty to clear).
  const cart = await updateSalesCart(input);
  return { cart, created: false };
}
