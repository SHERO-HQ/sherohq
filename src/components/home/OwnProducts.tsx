import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Section, SectionHeader } from "@/components/ui/Section";

const products = [
  {
    name: "Merchander",
    description:
      "Run a business that sells on WhatsApp and Instagram from one place: orders, payments, stock and pre-orders.",
    href: `${routes.merchander}#waitlist`,
    accent: "border-t-merchander",
  },
  {
    name: "Pharmasyst",
    description: "Sales, stock across branches and NHIS-ready claims for pharmacies with labs.",
    href: `${routes.pharmasyst}#waitlist`,
    accent: "border-t-pharmasyst",
  },
];

export function OwnProducts() {
  return (
    <Section id="products" divider className="scroll-mt-16" aria-labelledby="products-heading">
      <SectionHeader id="products-heading" eyebrow="our own products" title="Our own products." />
      <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {products.map((product) => (
          <li key={product.name}>
            <Link
              href={product.href}
              className={`group flex h-full flex-col gap-3 rounded-md border border-t-4 border-border p-6 transition-colors hover:bg-surface lg:p-8 ${product.accent}`}
            >
              <span className="flex flex-wrap items-center gap-3">
                <span className="font-display text-h2 text-heading">{product.name}</span>
                {/* Always "In development" (CLAUDE.md). */}
                <StatusBadge status="dev" />
              </span>
              <span className="text-body text-ink-secondary">{product.description}</span>
              <span className="mt-auto pt-2 text-label text-primary group-hover:underline">
                Join the waitlist <InlineArrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
