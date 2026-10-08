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
      { source: "/dashboard", destination: "/account", permanent: false },
      { source: "/portal", destination: "/account", permanent: false },
      { source: "/portal/:path*", destination: "/account", permanent: false },
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
      { source: "/appointments", destination: "/account", permanent: false },
      { source: "/prescriptions", destination: "/account/treatment", permanent: false },
      { source: "/messages", destination: "/account/messages", permanent: false },
      { source: "/profile", destination: "/account/profile", permanent: false },
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
