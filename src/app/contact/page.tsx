import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { site, whatsappLink } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a free consultation with SHERO or message us on WhatsApp.",
};

const channels = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    body: "The fastest way to reach us. Tell us what you need and we'll set up a free consultation.",
    href: whatsappLink("Hi SHERO, I'd like to book a free consultation."),
    cta: `Message ${site.whatsapp.display}`,
  },
  {
    icon: Mail,
    title: "Email",
    body: "Prefer to write it all down? Send the details and we'll reply within working hours.",
    href: `mailto:${site.email}?subject=${encodeURIComponent("Free consultation")}`,
    cta: site.email,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="contact"
        title="Book a free consultation"
        intro={`Tell us what's slowing your business down. A real person replies, ${site.hours.long}.`}
      />
      <Container className="grid gap-4 py-14 sm:py-20 md:grid-cols-2">
        {channels.map(({ icon: Icon, ...c }) => (
          <section key={c.title} aria-labelledby={`${c.title}-title`} className="flex flex-col rounded-card border border-border bg-surface-raised p-8">
            <Icon aria-hidden="true" size={24} strokeWidth={1.5} className="text-accent" />
            <h2 id={`${c.title}-title`} className="mt-5 text-2xl">
              {c.title}
            </h2>
            <p className="mt-2 text-ink-secondary">{c.body}</p>
            <a href={c.href} className="mt-6 inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4 hover:text-primary-hover">
              {c.cta}
            </a>
          </section>
        ))}
        <p className="font-mono text-xs text-ink-muted md:col-span-2">
          {site.location} · {site.hours.days}, {site.hours.open}–{site.hours.close} · Closed weekends and public holidays
        </p>
      </Container>
    </>
  );
}
