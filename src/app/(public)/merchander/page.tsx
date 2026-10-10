import type { Metadata } from "next";
import MerchanderView from "@/views/Merchander";

export const metadata: Metadata = {
  title: "Merchander | In Development",
  description:
    "Merchander by SHERO - A purposeful operating platform for growing retail and wholesale merchants. Point of sale, inventory tracking, Mobile Money reconciliation, and customer credit.",
};

export default function MerchanderPage() {
  return <MerchanderView />;
}
