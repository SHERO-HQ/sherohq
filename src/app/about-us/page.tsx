import type { Metadata } from "next";
import { ClosingCta } from "@/components/site/ClosingCta";
import { Container } from "@/components/ui/Container";
import { IllustrationSlot } from "@/components/ui/IllustrationSlot";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: "SHERO is a technology company based in Tamale, Ghana.",
};

const principles = [
  { title: "Truth over hype", body: "We only state what is true today: every number, service and status." },
  { title: "People over technology", body: "We talk about what technology makes possible for you, in plain words." },
  { title: "Radical clarity", body: "Clear offers, clear quotes, clear timelines. Nothing hidden in jargon." },
  { title: "Earned trust", body: "Credibility comes from delivering, one project at a time." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="about"
        title="Technology that opens doors, not adds complexity."
        intro={`SHERO is a technology company based in ${site.location}. We build software, look after IT and connect the tools businesses use, and we're building our own products for the way business really runs here.`}
      />
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.2fr]">
        <IllustrationSlot label="Tamale and the people SHERO works with" className="aspect-square w-full max-w-md" />
        <section aria-labelledby="principles">
          <h2 id="principles" className="text-3xl tracking-[-0.02em]">How we work</h2>
          <dl className="mt-8 grid gap-8 sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="border-t border-border pt-4">
                <dt className="font-display text-lg font-semibold text-heading">{p.title}</dt>
                <dd className="mt-2 text-ink-secondary">{p.body}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Container>
      <ClosingCta />
    </>
  );
}
