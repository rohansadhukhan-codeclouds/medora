/**
 * Temporary session bridge: teleform answers → checkout contact prefills.
 * PENDING: replace with AsterMD opportunity / patient APIs.
 */
export const CHECKOUT_CONTACT_DRAFT_KEY = "medora.checkout.contact.v1";

export type CheckoutContactDraft = {
  name: string;
  email: string;
  phone: string;
  savedAt: string;
};

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function saveCheckoutContactDraft(
  draft: Omit<CheckoutContactDraft, "savedAt">,
): void {
  if (!canUseSessionStorage()) return;
  try {
    const payload: CheckoutContactDraft = {
      ...draft,
      savedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(CHECKOUT_CONTACT_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // fail soft
  }
}

export function readCheckoutContactDraft(): CheckoutContactDraft | null {
  if (!canUseSessionStorage()) return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_CONTACT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutContactDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
    };
  } catch {
    return null;
  }
}
