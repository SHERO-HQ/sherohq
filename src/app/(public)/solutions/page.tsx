import type { Metadata } from "next";
import Solutions from "@/views/Solutions";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Custom software development, IT consulting, and tech solutions tailored for businesses of all sizes.",
};

export default function SolutionsPage() {
  return <Solutions />;
}
