import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ClosingCta } from "@/components/site/ClosingCta";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WorkImage } from "@/components/work/WorkImage";
import { talkToUs } from "@/content/navigation";
import { getWork, work, workSummary } from "@/content/work";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const item = getWork((await params).slug);
  return item ? { title: item.name, description: workSummary(item) } : {};
}

export default async function WorkDetailPage({ params }: { params: Promise<Params> }) {
  const item = getWork((await params).slug);
  if (!item) notFound();

  const index = work.indexOf(item);
  const next = work[(index + 1) % work.length];
  const host = new URL(item.link).host.replace(/^www\./, "");

  return (
    <>
      <header className="pt-10 pb-12 sm:pt-14 sm:pb-16">
        <Container>
          <Link href="/work" className="inline-flex h-9 items-center gap-2 text-sm text-ink-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.75} />
            Our Work
          </Link>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-3xl">
              <p className="text-ink-muted">
                {item.category} · For {item.client}
              </p>
              <h1 className="mt-3 text-4xl leading-[1.08] tracking-[-0.025em] sm:text-6xl">{item.name}</h1>
              <p className="mt-5 max-w-measure text-lg text-ink-secondary">{workSummary(item)}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={item.link}>
                Visit {host}
                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
              </ButtonLink>
              <ButtonLink href={talkToUs.href} variant="secondary">
                {talkToUs.label}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </header>

      <Container>
        <WorkImage
          item={item}
          priority
          sizes="(min-width: 1200px) 1152px, 100vw"
          className="aspect-[16/9] rounded-card border border-border"
        />
      </Container>

      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-20">
        <div className="max-w-[44rem] space-y-12">
          <section aria-labelledby="challenge">
            <h2 id="challenge" className="text-2xl tracking-[-0.015em] sm:text-3xl">
              The challenge
            </h2>
            <RichText text={item.challenge} className="mt-4 text-lg" />
          </section>
          <section aria-labelledby="built">
            <h2 id="built" className="text-2xl tracking-[-0.015em] sm:text-3xl">
              What we built
            </h2>
            <RichText text={item.whatWeBuilt} className="mt-4 text-lg" />
          </section>
        </div>

        <aside aria-label="Project facts" className="lg:sticky lg:top-24 lg:self-start">
          <dl className="divide-y divide-border rounded-card border border-border">
            {[
              ["Client", item.client],
              ["Category", item.category],
            ].map(([term, value]) => (
              <div key={term} className="p-5">
                <dt className="text-sm text-ink-muted">{term}</dt>
                <dd className="mt-1 font-medium text-ink">{value}</dd>
              </div>
            ))}
            <div className="p-5">
              <dt className="text-sm text-ink-muted">Status</dt>
              <dd className="mt-2">
                <StatusBadge status={item.status} />
              </dd>
            </div>
            {item.stack.length > 0 && (
              <div className="p-5">
                <dt className="text-sm text-ink-muted">Built with</dt>
                <dd className="mt-2">
                  <ul className="flex flex-wrap gap-2">
                    {item.stack.map((t) => (
                      <li key={t} className="rounded-md border border-border px-2 py-0.5 text-sm text-ink-secondary">
                        {t}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            <div className="p-5">
              <dt className="text-sm text-ink-muted">Website</dt>
              <dd className="mt-1">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-medium text-link underline-offset-4 hover:underline">
                  {host}
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </Container>

      {next && next !== item && (
        <Container className="pb-16 sm:pb-24">
          <Link
            href={`/work/${next.slug}`}
            className="group flex items-center justify-between gap-6 border-t border-border pt-8"
          >
            <span>
              <span className="block text-sm text-ink-muted">Next project</span>
              <span className="mt-1 block font-display text-2xl font-semibold text-heading sm:text-3xl">{next.name}</span>
            </span>
            <ArrowUpRight aria-hidden="true" size={28} strokeWidth={1.5} className="text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-link" />
          </Link>
        </Container>
      )}
      <ClosingCta title="Want something like this for your business?" />
    </>
  );
}
