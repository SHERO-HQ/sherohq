import { Placeholder } from "@/components/ui/Placeholder";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ProductPageContent } from "@/content/products";
import { WaitlistForm } from "./WaitlistForm";

/** One layout for every SHERO product; only content and colours change. */
export function ProductPage({ product }: { product: ProductPageContent }) {
  return (
    <div className={product.theme}>
      <section className="border-b border-border">
        <div className="container-site grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-22 py-section">
          <div className="flex flex-col gap-4 lg:gap-6.5">
            <div className="flex items-center gap-4">
              {/* TODO(owner): the product's logo file. */}
              <Placeholder
                label={`${product.name} logo`}
                className="h-10 border border-dashed border-border px-3.5 font-medium text-product-accent"
              />
              <StatusBadge status="dev" />
            </div>
            <h1 className="font-display text-h1 text-heading">
              {product.title}
            </h1>
            <p className="max-w-measure text-body lg:text-body-lg text-ink-secondary">
              <span className="lg:hidden">{product.problemMobile}</span>
              <span className="hidden lg:inline">{product.problem}</span>
            </p>
            <div className="flex flex-col gap-1.5 border-t border-border pt-4">
              <span className="font-mono text-meta font-medium text-product-accent">who it&rsquo;s for</span>
              <span className="text-body lg:text-body-lg font-medium text-ink">
                <span className="lg:hidden">{product.audienceMobile}</span>
                <span className="hidden lg:inline">{product.audience}</span>
              </span>
            </div>
          </div>
          <WaitlistForm product={product} />
        </div>
      </section>

      <section className="container-site pt-section">
        {/* Unreleased: the preview always carries a visible tag (CLAUDE.md). */}
        <figure className="flex flex-col gap-3">
          <div className="relative">
            <Placeholder
              label={product.previewLabel}
              className="aspect-[16/9] rounded-md border border-border bg-surface pt-8 lg:pt-0"
            />
            <StatusBadge status="dev" label="Preview · in development" className="absolute top-4 left-4" />
          </div>
          <figcaption className="text-body-sm text-ink-muted">
            An early look at the {product.name} dashboard. It will change before launch.
          </figcaption>
        </figure>
      </section>

      <section className="container-site flex flex-col gap-6 py-section lg:gap-10">
        <h2 className="font-display text-h2 text-heading">
          <span className="lg:hidden">{product.compareTitleMobile}</span>
          <span className="hidden lg:inline">{product.compareTitle}</span>
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
                  <span className="lg:hidden">{row.todayMobile ?? row.today}</span>
                  <span className="hidden lg:inline">{row.today}</span>
                </td>
                <td className="text-body lg:text-body-lg font-medium text-ink lg:py-6">
                  <span className="mr-2 font-mono text-meta font-medium text-product-accent lg:hidden">with</span>
                  <span className="lg:hidden">{row.withMobile ?? row.with}</span>
                  <span className="hidden lg:inline">{row.with}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  );
}
