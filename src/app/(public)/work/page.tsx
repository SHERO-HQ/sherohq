import type { Metadata } from "next";
import Work from "@/views/Work";

export const metadata: Metadata = {
  title: "Our Work",
  description: "Projects and products built by SHERO in Tamale, Ghana.",
};

export default function WorkPage() {
  return <Work />;
}
