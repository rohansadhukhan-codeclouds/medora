const STORAGE_KEY = "medora:nav-history";
const MAX_STACK = 16;

const PATH_LABELS: Record<string, string> = {
  "/": "Home",
  "/treatments": "Treatments",
  "/cart": "Cart",
  "/how-it-works": "How it works",
  "/faq": "FAQ",
  "/about": "About",
  "/eligibility": "Eligibility",
  "/checkout": "Checkout",
  "/plan": "Plan",
  "/intake": "Intake",
  "/verification": "Verification",
  "/review": "Review",
  "/status": "Status",
};

function readStack(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function writeStack(stack: string[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack.slice(-MAX_STACK)));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/** Call on every client navigation to keep a short path history. */
export function recordNavPath(pathname: string) {
  const path = pathname.trim() || "/";
  const stack = readStack();
  if (stack[stack.length - 1] === path) return;
  stack.push(path);
  writeStack(stack);
}

export function labelForPath(pathname: string): string {
  const path = pathname.trim() || "/";
  if (PATH_LABELS[path]) return PATH_LABELS[path];

  if (path.startsWith("/catalog/")) return "Product";

  const segment = path.split("/").filter(Boolean).pop() ?? "Page";
  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export type BreadcrumbCrumb = {
  href?: string;
  label: string;
};

/**
 * Build a live trail: Home → origin page (if any) → current label.
 * Origin comes from in-app navigation history (sessionStorage).
 */
export function buildLiveBreadcrumbs(input: {
  currentPath: string;
  currentLabel: string;
  fallbackOriginHref?: string;
}): BreadcrumbCrumb[] {
  const current = input.currentPath.trim() || "/";
  const fallback = input.fallbackOriginHref ?? "/treatments";
  const stack = readStack();

  let origin: string | null = null;
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const entry = stack[i];
    if (!entry || entry === current) continue;
    // Prefer the last non-catalog page so product→product doesn't nest oddly.
    if (entry.startsWith("/catalog/")) continue;
    origin = entry;
    break;
  }

  if (!origin) {
    origin = fallback;
  }

  const crumbs: BreadcrumbCrumb[] = [{ href: "/", label: "Home" }];

  if (origin !== "/") {
    crumbs.push({ href: origin, label: labelForPath(origin) });
  }

  crumbs.push({ label: input.currentLabel });
  return crumbs;
}
