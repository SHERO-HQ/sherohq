import { ProductCard } from "@/components/ui/ProductCard";
import { Section } from "@/components/ui/Section";
import { products } from "@/content/products";

export function Building() {
  return (
    <Section
      id="building"
      title="What we're building"
      intro="Our own products, made for how business really runs here. Neither is released yet."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </Section>
  );
}
