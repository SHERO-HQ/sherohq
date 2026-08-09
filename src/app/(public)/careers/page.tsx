import type { Metadata } from "next";
import Careers from "@/views/Careers";

export const metadata: Metadata = {
  title: "Careers | SHERO",
  description: "Join the SHERO team and help us build the future of technology with integrity and excellence.",
};

export default function CareersPage() {
  return <Careers />;
}

