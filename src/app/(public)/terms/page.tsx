import type { Metadata } from "next";
import Terms from "@/views/Terms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Shero Technologies services.",
};

export default function TermsPage() {
  return <Terms />;
}
