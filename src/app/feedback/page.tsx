import type { Metadata } from "next";
import { ContactOptions } from "@/components/site/ContactOptions";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Tell SHERO what we're doing well and what we should do better.",
};

export default function FeedbackPage() {
  return (
    <>
      <PageHeader
        title="Tell us how we're doing"
        intro="Good or bad, we read every message. It's how we get better."
      />
      <Container className="py-14 sm:py-20">
        <ContactOptions
          message="Hi SHERO, here's some feedback:"
          subject="Feedback"
          whatsappBody="Send your feedback on WhatsApp. Voice notes are fine too."
        />
      </Container>
    </>
  );
}
