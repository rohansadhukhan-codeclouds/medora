import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.astermd.com" },
      { protocol: "https", hostname: "api.astermd.com" },
      { protocol: "https", hostname: "health.api.staging.besimplified.net" },
    ],
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/", permanent: false },
      { source: "/portal", destination: "/", permanent: false },
      { source: "/portal/:path*", destination: "/", permanent: false },
      // Keep /account/create (care-flow) — only redirect retired account pages.
      { source: "/account", destination: "/", permanent: false },
      { source: "/account/treatment", destination: "/", permanent: false },
      { source: "/account/orders", destination: "/", permanent: false },
      { source: "/account/subscription", destination: "/", permanent: false },
      { source: "/account/messages", destination: "/", permanent: false },
      { source: "/account/profile", destination: "/", permanent: false },
      { source: "/login", destination: "/", permanent: false },
      { source: "/register", destination: "/eligibility", permanent: false },
      { source: "/categories", destination: "/treatments", permanent: false },
      {
        source: "/categories/:slug",
        destination: "/treatments",
        permanent: false,
      },
      { source: "/products", destination: "/treatments", permanent: false },
      {
        source: "/treatments/:slug",
        destination: "/treatments",
        permanent: false,
      },
      { source: "/medical-intake", destination: "/intake", permanent: false },
      { source: "/order", destination: "/status", permanent: false },
      { source: "/appointments", destination: "/", permanent: false },
      { source: "/prescriptions", destination: "/", permanent: false },
      { source: "/messages", destination: "/", permanent: false },
      { source: "/profile", destination: "/", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
