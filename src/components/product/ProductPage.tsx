import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { productArt } from "@/components/illustrations";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { site, whatsappLink } from "@/content/site";
import type { Product } from "@/content/types";

/** Shared layout for SHERO's own products: status, problem, who, what, waitlist. */
export function ProductPage({ product }: { product: Product }) {
  const ProductArt = productArt[product.slug];
  return (
    <>
      <PageHeader title={product.name} intro={product.forWho}>
        <StatusBadge status={product.status} className="mt-6" />
      </PageHeader>
      <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-2">
        <div className="space-y-10">
          <section aria-labelledby="problem">
            <h2 id="problem" className="text-2xl">The problem</h2>
            <p className="mt-3 text-lg text-ink-secondary">{product.problem}</p>
          </section>
          <section aria-labelledby="will-do">
            <h2 id="will-do" className="text-2xl">What it will do</h2>
            <ul className="mt-4 space-y-3">
              {product.willDo.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check aria-hidden="true" size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <ProductArt className="w-full max-w-md justify-self-center" />
      </Container>
      <section aria-labelledby="waitlist" className="pb-16 sm:pb-24">
        <Container>
          <div className="rounded-card border border-border bg-surface p-8 sm:p-12">
            <h2 id="waitlist" className="text-3xl tracking-[-0.02em]">
              Join the waitlist
            </h2>
            <p className="mt-3 max-w-measure text-ink-secondary">
              {product.name} isn&apos;t released yet. Send us a message and we&apos;ll tell you when it&apos;s ready.
              We won&apos;t use your number for anything else.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={whatsappLink(product.waitlistMessage)}>Join on WhatsApp</ButtonLink>
              <ButtonLink
                href={`mailto:${site.email}?subject=${encodeURIComponent(`${product.name} waitlist`)}`}
                variant="secondary"
              >
                Join by email
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
