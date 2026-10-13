import { Mail, MessageCircle } from "lucide-react";
import { site, whatsappLink } from "@/content/site";

type Props = {
  /** Prefilled WhatsApp message and email subject for this context. */
  message?: string;
  subject?: string;
  whatsappBody?: string;
  emailBody?: string;
};

/** The two ways to reach SHERO, used wherever a page asks people to get in touch. */
export function ContactOptions({
  message,
  subject,
  whatsappBody = "The fastest way to reach us. Ask a question, report a problem, or tell us what you need.",
  emailBody = "Prefer to write it all down? Send the details and we'll reply within working hours.",
}: Props) {
  const channels = [
    { icon: MessageCircle, title: "WhatsApp", body: whatsappBody, href: whatsappLink(message), cta: `Message ${site.whatsapp.display}` },
    {
      icon: Mail,
      title: "Email",
      body: emailBody,
      href: `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`,
      cta: site.email,
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {channels.map(({ icon: Icon, ...c }) => (
        <section key={c.title} aria-labelledby={`${c.title}-title`} className="flex flex-col rounded-card border border-border bg-surface-raised p-8">
          <Icon aria-hidden="true" size={24} strokeWidth={1.5} className="text-accent" />
          <h2 id={`${c.title}-title`} className="mt-5 text-2xl">
            {c.title}
          </h2>
          <p className="mt-2 text-ink-secondary">{c.body}</p>
          <a href={c.href} className="mt-6 inline-flex min-h-11 items-center font-medium text-link underline underline-offset-4 hover:text-link-hover">
            {c.cta}
          </a>
        </section>
      ))}
      <p className="font-mono text-xs text-ink-muted md:col-span-2">
        {site.location} · {site.hours.days}, {site.hours.open}–{site.hours.close} · Closed weekends and public holidays
      </p>
    </div>
  );
}
