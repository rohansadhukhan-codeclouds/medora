export const siteConfig = {
  name: "Medora Health",
  shortName: "Medora",
  description:
    "Medora Health provides convenient online access to licensed healthcare professionals. Tell us about your health, get a provider review, and receive personalized care guidance when appropriate.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "en_US",
  links: {
    support: "mailto:support@medorahealth.example",
    privacy: "/privacy",
    terms: "/terms",
  },
} as const;

export type SiteConfig = typeof siteConfig;
