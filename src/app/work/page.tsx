import type { Metadata } from "next";
import { ClosingCta } from "@/components/site/ClosingCta";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCard } from "@/components/ui/ProductCard";
import { Section } from "@/components/ui/Section";
import { WorkGrid } from "@/components/work/WorkGrid";
import { products } from "@/content/products";
import { work } from "@/content/work";

export const metadata: Metadata = {
  title: "Our Work",
  description: "Client projects SHERO has built and the products SHERO is building, shown with permission.",
};

export default function WorkPage() {
  return (
    <>
      <PageHeader
        title="What we've built"
        intro="Systems and sites that are live and in use today, shown with our clients' permission, and the products we're building next."
      />
      <Section id="clients" title="Built for clients">
        <WorkGrid items={work} />
      </Section>
      <Section
        id="products"
        tone="surface"
        title="SHERO products"
        intro="Our own products, in development. Join a waitlist to hear first."
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {products.map((p) => (
            <li key={p.slug} className="flex">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </Section>
      <div className="pt-16 sm:pt-24">
        <ClosingCta title="Want something like this for your business?" />
      </div>
    </>
  );
}
