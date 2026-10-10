import type { Metadata } from "next";
import MerchanderView from "@/views/Merchander";

export const metadata: Metadata = {
  title: "Merchander",
  description:
    "Merchander is in development: one place to run a business that sells on social media.",
};

export default function MerchanderPage() {
  return <MerchanderView />;
}
