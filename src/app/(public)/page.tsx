import type { Metadata } from "next";
import HomePage from "@/views/Home";

export const metadata: Metadata = {
  title: { absolute: "SHERO - Redefine Possible" },
  description:
    "Innovative technology solutions that scale to elevate people, businesses, and communities. Premium tech products, consultation, partnerships, and custom software development.",
};

export default function Page() {
  return <HomePage />;
}
