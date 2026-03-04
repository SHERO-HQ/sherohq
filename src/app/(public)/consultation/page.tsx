import type { Metadata } from "next";
import Consultation from "@/views/Consultation";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description:
    "Schedule a free consultation with SHERO's technology experts. Let's discuss your project and how we can help.",
};

export default function ConsultationPage() {
  return <Consultation />;
}
