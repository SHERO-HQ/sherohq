import type { Metadata } from "next";
import Privacy from "@/views/Privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Shero Technologies collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return <Privacy />;
}
