import { ArrowUpRight } from "lucide-react";
import { Placeholder } from "@/components/ui/Placeholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Product } from "@/lib/products";
import { waitlistConfig } from "@/lib/products";
import { themeClass } from "@/lib/product-themes";
import { WaitlistForm } from "./WaitlistForm";

/** One layout for every SHERO product; content, colours and status come from the admin. */
export function ProductPage({ product }: { product: Product }) {
  const inDevelopment = product.status === "in_development";
  return (
    <div className={themeClass(product.theme)}>
      <section className="border-b border-border">
        <div className="container-site grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-22 py-section">
          <div className="flex flex-col gap-4 lg:gap-6.5">
            <div className="flex items-center gap-4">
              {/* TODO(owner): the product's logo file. */}
              <Placeholder
                label={`${product.name} logo`}
                className="h-10 border border-dashed border-border px-3.5 font-medium text-product-accent"
              />
              {/* Unreleased products are always labelled (CLAUDE.md). */}
              <StatusBadge status={inDevelopment ? "dev" : "live"} />
            </div>
            <h1 className="font-display text-h1 text-heading">{product.title}</h1>
            <p className="max-w-measure text-body lg:text-body-lg text-ink-secondary">{product.problem}</p>
            <div className="flex flex-col gap-1.5 border-t border-border pt-4">
              <span className="font-mono text-meta font-medium text-product-accent">who it&rsquo;s for</span>
              <span className="text-body lg:text-body-lg font-medium text-ink">{product.audience}</span>
            </div>
          </div>
          {inDevelopment ? (
            <WaitlistForm product={waitlistConfig(product)} />
          ) : (
            product.liveUrl && (
              <div className="flex flex-col items-start gap-4 self-start rounded-md border border-t-4 border-border border-t-product-stripe bg-surface p-5 lg:p-8">
                <h2 className="font-display text-h2 text-heading">{product.name} is live</h2>
                <a
                  href={product.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  // The product's own action colour, like the waitlist button.
                  className="inline-flex h-10 items-center gap-2 rounded-sm bg-product-action px-5 text-label text-on-product-action transition-opacity duration-150 hover:opacity-90"
                >
                  Open {product.name} <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
                </a>
              </div>
            )
          )}
        </div>
      </section>

      <section className="container-site pt-section">
        <figure className="flex flex-col gap-3">
          <div className="relative">
            {product.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.previewUrl}
                alt={`The ${product.name} dashboard`}
                className="aspect-[16/9] w-full rounded-md border border-border bg-surface object-cover object-top"
              />
            ) : (
              <Placeholder
                label={`Dashboard preview: ${product.name}`}
                className="aspect-[16/9] rounded-md border border-border bg-surface pt-8 lg:pt-0"
              />
            )}
            {/* While unreleased, the preview always carries a visible tag (CLAUDE.md). */}
            {inDevelopment && (
              <StatusBadge status="dev" label="Preview · in development" className="absolute top-4 left-4" />
            )}
          </div>
          {inDevelopment && (
            <figcaption className="text-body-sm text-ink-muted">
              An early look at the {product.name} dashboard. It will change before launch.
            </figcaption>
          )}
        </figure>
      </section>

      {product.compare.length > 0 && (
        <section className="container-site flex flex-col gap-6 py-section lg:gap-10">
          <h2 className="font-display text-h2 text-heading">
            {inDevelopment ? `From how it works today, to what ${product.name} will do.` : `What ${product.name} changes.`}
          </h2>
          <table className="w-full border-collapse text-left">
            <thead className="hidden lg:table-header-group">
              <tr className="border-b border-border font-mono text-meta">
                <th className="w-1/2 pr-14 pb-3 font-normal text-ink-muted">today</th>
                <th className="pb-3 font-medium text-product-accent">with {product.name.toLowerCase()}</th>
              </tr>
            </thead>
            <tbody className="border-t border-border lg:border-t-0">
              {product.compare.map((row) => (
                <tr key={row.today} className="flex flex-col gap-1 border-b border-border py-4 lg:table-row lg:py-0">
                  <td className="text-body lg:text-body-lg text-ink-secondary lg:py-6 lg:pr-14">
                    <span className="mr-2 font-mono text-meta text-ink-muted lg:hidden">today</span>
                    {row.today}
                  </td>
                  <td className="text-body lg:text-body-lg font-medium text-ink lg:py-6">
                    <span className="mr-2 font-mono text-meta font-medium text-product-accent lg:hidden">with</span>
                    {row.with}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
