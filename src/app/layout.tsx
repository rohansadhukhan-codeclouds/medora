import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { buildMetadata } from "@/config/metadata";
import { JourneyProvider } from "@/features/journey/context/journey-provider";
import { ChannelProvider } from "@/providers/channel-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const medoraSans = Plus_Jakarta_Sans({
  variable: "--font-medora-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = buildMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${medoraSans.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <ChannelProvider>
            <JourneyProvider>{children}</JourneyProvider>
          </ChannelProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
