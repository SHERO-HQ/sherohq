import type { Metadata } from "next";
import Consultation from "@/views/Consultation";

export const metadata: Metadata = {
 title: "Book a Consultation",
 description:
 "Book a consultation with SHERO. Tell us about your project and how we can help.",
};

export default function ConsultationPage() {
 return <Consultation />;
}
