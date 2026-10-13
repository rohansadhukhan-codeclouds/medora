import { HomePage } from "@/features/marketing/home-page";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Online healthcare that fits your life",
  path: "/",
});

export default function MarketingHomePage() {
  return <HomePage />;
}
