import Link from "next/link";
import type { Product } from "@/content/types";
import { StatusBadge } from "./StatusBadge";

export function ProductCard({ product, headingLevel = "h3" }: { product: Product; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className="flex flex-col gap-4 rounded-card border border-border bg-surface-raised p-6 sm:p-8">
      <StatusBadge status={product.status} className="self-start" />
      <Heading className="text-3xl tracking-[-0.02em]">{product.name}</Heading>
      <p className="text-ink-secondary">
        For {product.forWho.charAt(0).toLowerCase() + product.forWho.slice(1)} {product.problem}
      </p>
      <Link
        href={`/${product.slug}`}
        className="mt-auto inline-flex min-h-11 items-center font-medium text-link underline-offset-4 hover:underline"
      >
        Join the {product.name} waitlist
      </Link>
    </article>
  );
}
