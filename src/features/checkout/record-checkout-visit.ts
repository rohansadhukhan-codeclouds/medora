import type { CartItem } from "@/stores/cart-store";

/**
 * Browser → BFF checkout_visited. Fail-soft; does not throw into the page.
 */
export async function recordCheckoutVisit(items: CartItem[]): Promise<void> {
  try {
    const response = await fetch("/api/checkout/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        event: "checkout_visited",
        payment_method: "card",
        currency: "USD",
        upsell: [],
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.priceCents ?? 0,
          priceCents: item.priceCents ?? 0,
        })),
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    if (!response.ok || !payload.ok) {
      console.warn(
        "[checkout] visit event failed",
        payload.error || response.status,
      );
    }
  } catch {
    console.warn("[checkout] visit event failed");
  }
}
