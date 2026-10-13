import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about SHERO.",
};

const link = "font-medium text-primary underline underline-offset-4 hover:text-primary-hover";

const faqs: { q: string; a: ReactNode }[] = [
  { q: "Where are you based?", a: `In ${site.location}. We work with businesses across Ghana, on site or remotely.` },
  {
    q: "When can I reach you?",
    a: `${site.hours.long}. We're closed on weekends and public holidays, and we don't offer 24/7 support.`,
  },
  {
    q: "How much does a project cost?",
    a: (
      <>
        It depends on what you need, so we don&apos;t publish prices. After a{" "}
        <Link href="/consultation" className={link}>
          free consultation
        </Link>{" "}
        you get a clear written quote.
      </>
    ),
  },
  {
    q: "Do you still sell laptops?",
    a: (
      <>
        Yes. Our tested refurbished laptops are now sold through{" "}
        <Link href="/merchander" className={link}>
          Merchander
        </Link>
        .
      </>
    ),
  },
  {
    q: "Can I use Merchander or Pharmasyst today?",
    a: (
      <>
        Not yet. Both are in development. Join the{" "}
        <Link href="/merchander" className={link}>
          Merchander
        </Link>{" "}
        or{" "}
        <Link href="/pharmasyst" className={link}>
          Pharmasyst
        </Link>{" "}
        waitlist and we&apos;ll tell you when they&apos;re ready.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader eyebrow="faq" title="Questions, answered" />
      <Container className="max-w-3xl py-14 sm:py-20">
        <div className="divide-y divide-border border-y border-border">
          {faqs.map((f) => (
            <details key={f.q} className="group py-2">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-heading [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden="true" className="text-xl text-ink-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-ink-secondary">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </>
  );
}
