import type { Metadata } from "next";
import Solutions from "@/views/Solutions";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Software and technology solutions we build for businesses, and the services behind them.",
};

export default function SolutionsPage() {
  return <Solutions />;
}
