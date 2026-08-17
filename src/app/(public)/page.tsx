import type { Metadata } from "next";
import HomePage from "@/views/Home";

export const metadata: Metadata = {
  title: { absolute: "SHERO" },
  description:
    "Purposeful technology solutions that expand possibilities. Reliable hardware, custom software, and managed IT to help businesses and communities achieve more.",
};

export default function Page() {
  return <HomePage />;
}
