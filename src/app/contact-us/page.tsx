import type { Metadata } from "next";
import { ContactOptions } from "@/components/site/ContactOptions";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Talk to SHERO on WhatsApp or by email.",
};

export default function ContactUsPage() {
  return (
    <>
      <PageHeader
        eyebrow="contact us"
        title="Talk to us"
        intro={`Tell us what's slowing your business down. A real person replies, ${site.hours.long}.`}
      />
      <Container className="py-14 sm:py-20">
        <ContactOptions />
      </Container>
    </>
  );
}
