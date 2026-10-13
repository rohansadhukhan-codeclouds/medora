export type NavItem = {
  title: string;
  href: string;
  description?: string;
};

/** Primary nav for end-user / storefront pages. */
export const siteNav: NavItem[] = [
  { title: "Products", href: "/treatments" },
  { title: "How it works", href: "/how-it-works" },
  { title: "FAQ", href: "/faq" },
  { title: "About", href: "/about" },
];
