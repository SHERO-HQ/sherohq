import type { Metadata } from "next";
import Careers from "@/views/Careers";

export const metadata: Metadata = {
  title: "Careers | SHERO Technologies",
  description: "Join the SHERO Technologies team and help us build the future of tech retail in Ghana. View our open roles and company benefits.",
};

export default function CareersPage() {
  return <Careers />;
}

