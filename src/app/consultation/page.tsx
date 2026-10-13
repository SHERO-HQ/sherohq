import type { Metadata } from "next";
import { ContactOptions } from "@/components/site/ContactOptions";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Consultation",
  description: "Book a free consultation with SHERO about software, IT or integrations for your business.",
};

const steps = [
  { title: "Tell us what you need", body: "Send a message about the problem you want solved. A rough idea is enough." },
  { title: "We talk it through", body: "We ask questions, look at how you work today, and tell you plainly what's possible." },
  { title: "You get a clear quote", body: "If it makes sense to work together, you get a written scope and price. No obligation." },
];

export default function ConsultationPage() {
  return (
    <>
      <PageHeader
        eyebrow="consultation"
        title="Book a free consultation"
        intro="A conversation about your business and the technology it needs. Free, and you're under no obligation."
      />
      <Container className="py-14 sm:py-20">
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-card border border-border p-6">
              <span className="font-mono text-xs text-accent">0{i + 1}</span>
              <h2 className="mt-3 text-xl">{s.title}</h2>
              <p className="mt-2 text-ink-secondary">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>
      <Container className="pb-16 sm:pb-24">
        <ContactOptions
          message="Hi SHERO, I'd like to book a free consultation."
          subject="Free consultation"
          whatsappBody="Message us to book. Tell us a little about your business and a good time to talk."
        />
      </Container>
    </>
  );
}
