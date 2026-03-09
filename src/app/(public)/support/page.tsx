import type { Metadata } from "next";
import Support from "@/views/Support";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with Shero Technologies products and services.",
};

export default function SupportPage() {
  return <Support />;
}
