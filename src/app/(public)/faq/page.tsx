import type { Metadata } from "next";
import Faq from "@/views/FAQ";

export const metadata: Metadata = {
 title: "FAQ",
 description:
 "Answers to your most common questions about SHERO services, hardware requests, and support.",
};

export default function FaqPage() {
 return <Faq />;
}
