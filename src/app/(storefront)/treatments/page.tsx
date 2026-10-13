import { HomeChannelProducts } from "@/features/catalog/components/home-channel-products";
import { buildMetadata } from "@/config/metadata";

export const metadata = buildMetadata({
  title: "Treatments",
  description: "Browse Medora Health treatments from your AsterMD channel.",
  path: "/treatments",
});

export default function TreatmentsPage() {
  return (
    <div className="pb-8 pt-4">
      <HomeChannelProducts />
    </div>
  );
}
