import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClosingCta } from "@/components/site/ClosingCta";
import { Container } from "@/components/ui/Container";
import { IllustrationSlot } from "@/components/ui/IllustrationSlot";
import { PageHeader } from "@/components/ui/PageHeader";
import { TextLink } from "@/components/ui/TextLink";
import { getWork, work } from "@/content/work";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return work.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const item = getWork((await params).slug);
  return item ? { title: item.name, description: item.summary ?? `${item.name}, a SHERO client project.` } : {};
}

const PENDING = "[Text from SHERO]";

export default async function WorkDetailPage({ params }: { params: Promise<Params> }) {
  const item = getWork((await params).slug);
  if (!item) notFound();

  return (
    <>
      <PageHeader eyebrow={item.client ? `work · for ${item.client.toLowerCase()}` : "work"} title={item.name} intro={item.summary ?? PENDING} />
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <section aria-labelledby="challenge">
            <h2 id="challenge" className="text-2xl">The challenge</h2>
            <p className="mt-3 text-ink-secondary">{item.challenge ?? PENDING}</p>
          </section>
          <section aria-labelledby="built">
            <h2 id="built" className="text-2xl">What we built</h2>
            <p className="mt-3 text-ink-secondary">{item.whatWeBuilt ?? PENDING}</p>
          </section>
          <TextLink href="/work">All work</TextLink>
        </div>
        <IllustrationSlot label={`${item.name} screenshot`} className="aspect-[4/3] w-full" />
      </Container>
      <ClosingCta />
    </>
  );
}
