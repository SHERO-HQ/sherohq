import type { Metadata } from "next";
import Link from "next/link";
import { ClosingCta } from "@/components/site/ClosingCta";
import { Container } from "@/components/ui/Container";
import { IllustrationSlot } from "@/components/ui/IllustrationSlot";
import { PageHeader } from "@/components/ui/PageHeader";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Solutions",
  description: "Custom software, managed IT, integrations and refurbished hardware from SHERO in Tamale, Ghana.",
};

export default function SolutionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="solutions"
        title="What we can do for your business"
        intro="Every engagement starts with a conversation. No prices until we understand what you need, and then a clear quote."
      />
      <Container className="divide-y divide-border">
        {services.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="grid scroll-mt-20 gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="font-mono text-xs text-accent">{s.index}</p>
              <h2 id={`${s.id}-title`} className="mt-2 text-3xl tracking-[-0.02em]">
                {s.name}
              </h2>
              <p className="mt-3 text-lg text-ink-secondary">{s.summary}</p>
              <IllustrationSlot label={s.name.toLowerCase()} className="mt-8 aspect-[4/3] max-w-sm" />
            </div>
            <dl className="grid gap-8 self-center">
              <div>
                <dt className="font-mono text-xs text-ink-muted">Who it&apos;s for</dt>
                <dd className="mt-2">{s.forWho}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-muted">What&apos;s included</dt>
                <dd className="mt-2">
                  <ul className="list-disc space-y-1 pl-5 marker:text-accent">
                    {s.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-ink-muted">How it starts</dt>
                <dd className="mt-2">
                  {s.howItStarts}{" "}
                  <Link href={s.href ?? "/consultation"} className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover">
                    {s.href ? "Go to Merchander" : "Book a free consultation"}
                  </Link>
                </dd>
              </div>
            </dl>
          </section>
        ))}
      </Container>
      <ClosingCta title="Tell us what's slowing you down." />
    </>
  );
}
