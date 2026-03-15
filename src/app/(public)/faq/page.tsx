import type { Metadata } from "next";
import Faq from "@/views/FAQ";

export const metadata: Metadata = {
 title: "FAQ",
 description:
 "Answers to your most common questions about SHERO products, services, orders, and support.",
};

export default function FaqPage() {
 return <Faq />;
}
