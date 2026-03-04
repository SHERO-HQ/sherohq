import type { Metadata } from "next";
import Contact from "@/views/Contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with SHERO. We'd love to hear from you — whether it's a project inquiry or general question.",
};

export default function ContactPage() {
  return <Contact />;
}
