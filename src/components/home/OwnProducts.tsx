import { PharmacySpot, ProductSpot, SocialSpot } from "@/components/illustrations/ServiceArt";
import { CardBody, CardLink, CardMedia } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { Section, SectionHeader } from "@/components/ui/Section";
import { productPath, type Product } from "@/lib/products";
import { themeClass } from "@/lib/product-themes";
import { cn } from "@/lib/cn";

// The drawn spot illustrations for the first two products; others show their
// dashboard preview, or a plain spot in their own colour.
const spots: Record<string, typeof SocialSpot> = { merchander: SocialSpot, pharmasyst: PharmacySpot };

/** SHERO's own products, from the admin. The only place they appear on Home. */
export function OwnProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <Section id="products" divider className="scroll-mt-16" aria-labelledby="products-heading">
      <SectionHeader id="products-heading" title="Our own products." />
      <ul className={cn("grid gap-4 lg:gap-6", products.length > 1 && "lg:grid-cols-2", products.length > 2 && "xl:grid-cols-3")}>
        {products.map((product) => {
          const inDevelopment = product.status === "in_development";
          const Spot = spots[product.slug];
          return (
            <li key={product.id} className={themeClass(product.theme)}>
              <CardLink
                href={inDevelopment ? `${productPath(product.slug)}#waitlist` : productPath(product.slug)}
                className="h-full border-t-2 border-t-product-stripe"
              >
                <CardMedia className="flex h-32 justify-center px-6 py-4">
                  {Spot ? (
                    <Spot className="h-24 w-auto transition-transform duration-200 group-hover:scale-105" />
                  ) : product.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.previewUrl} alt="" className="h-24 w-auto rounded-md border border-border object-cover transition-transform duration-200 group-hover:scale-105" />
                  ) : (
                    <ProductSpot className="h-24 w-auto transition-transform duration-200 group-hover:scale-105" />
                  )}
                </CardMedia>
                <CardBody className="gap-3">
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-h3 text-heading">{product.name}</span>
                    {/* Unreleased products are always labelled (CLAUDE.md). */}
                    <StatusBadge status={inDevelopment ? "dev" : "live"} />
                  </span>
                  <span className="text-body text-ink-secondary">{product.summary}</span>
                  <span className="mt-auto pt-2 text-label text-primary group-hover:underline">
                    {inDevelopment ? "Join the waitlist" : `See ${product.name}`} <InlineArrow className="transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                </CardBody>
              </CardLink>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
