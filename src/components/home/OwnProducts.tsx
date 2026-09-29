import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/lib/site";
import { InlineArrow } from "@/components/ui/InlineArrow";

const products = [
  {
    name: "Merchander",
    description:
      "Run a business that sells on WhatsApp and Instagram from one place: orders, payments, stock and pre-orders.",
    descriptionMobile: "Run a business that sells on WhatsApp and Instagram from one place.",
    href: `${routes.merchander}#waitlist`,
    accent: "border-t-merchander",
  },
  {
    name: "Pharmasyst",
    description: "Sales, stock across branches and NHIS-ready claims for pharmacies with labs.",
    descriptionMobile: "Sales, stock and NHIS-ready claims for pharmacies with labs.",
    href: `${routes.pharmasyst}#waitlist`,
    accent: "border-t-pharmasyst",
  },
];

export function OwnProducts() {
  return (
    <section
      id="products"
      className="container-site flex scroll-mt-20 flex-col gap-4 pt-16 lg:gap-8 lg:pt-[104px]"
    >
      <h2 className="font-display text-[30px]/[33px] font-bold tracking-[-0.02em] text-heading lg:text-5xl/[52px] lg:tracking-[-0.025em]">
        Our own products.
      </h2>
      <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {products.map((product) => (
          <li key={product.name}>
            <Link
              href={product.href}
              className={`group flex h-full flex-col gap-3 rounded-md border border-t-[3px] border-border bg-surface p-6 lg:gap-[18px] lg:px-10 lg:pt-10 lg:pb-9 ${product.accent}`}
            >
              <span className="flex flex-wrap items-center gap-2.5 lg:gap-3.5">
                <span className="font-display text-[26px]/[30px] font-bold text-heading lg:text-4xl/10 lg:tracking-[-0.02em]">
                  {product.name}
                </span>
                <span className="flex lg:hidden">
                  <StatusBadge status="dev" label="waitlist" size="sm" />
                </span>
                <span className="hidden lg:flex">
                  <StatusBadge status="dev" />
                </span>
              </span>
              <span className="text-[15px]/[23px] text-ink-secondary lg:text-[17px]/[27px]">
                <span className="lg:hidden">{product.descriptionMobile}</span>
                <span className="hidden lg:inline">{product.description}</span>
              </span>
              <span className="text-[15px]/[22px] font-medium text-primary group-hover:underline lg:text-sm/5">
                Join the waitlist <InlineArrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
