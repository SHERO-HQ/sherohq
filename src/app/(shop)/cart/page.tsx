import type { Metadata } from "next";
import { buttonClass } from "@/components/ui/Button";
import { cookies } from "next/headers";
import Link from "next/link";
import { listingHref } from "@/components/shop/ListingCard";
import { ListingPhoto } from "@/components/shop/ListingPhoto";
import { SummaryRow, SummaryTotal } from "@/components/shop/OrderSummary";
import { RemoveFromCart } from "@/components/shop/RemoveFromCart";
import { InlineArrow } from "@/components/ui/InlineArrow";
import { CART_COOKIE, parseCart } from "@/lib/cart";
import { formatCedis } from "@/lib/orders";
import { getListingsByIds, getShopSettings } from "@/lib/shop";
import { shopUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false },
};

export default async function CartPage() {
  const ids = parseCart((await cookies()).get(CART_COOKIE)?.value);
  const [rows, settings] = await Promise.all([getListingsByIds(ids), getShopSettings()]);
  // Keep the order items were added in; drop ids that no longer exist.
  const items = ids.map((id) => rows.find((row) => row.id === id)).filter((row) => row !== undefined);
  const available = items.filter((item) => item.status === "in_stock");
  const subtotal = available.reduce((sum, item) => sum + item.pricePesewas, 0);
  const free = subtotal >= settings.freeDeliveryThresholdPesewas;
  const threshold = formatCedis(settings.freeDeliveryThresholdPesewas);

  return (
    <>
      <section className="container-site pb-6 lg:pb-10 pt-section">
        <h1 className="font-display text-h1 text-heading">
          Your cart
        </h1>
      </section>

      {items.length === 0 ? (
        <section className="container-site flex flex-col items-start gap-4 pb-section">
          <p className="text-body-lg text-ink-secondary">Your cart is empty.</p>
          <Link
            href={shopUrl.home}
            className={buttonClass({ size: "lg" })}
          >
            Browse laptops in stock
          </Link>
        </section>
      ) : (
        <section className="container-site grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-16 pb-section">
          <div>
            <ul className="border-t border-border">
              {items.map((item) => {
                const sold = item.status !== "in_stock";
                return (
                  <li
                    key={item.id}
                    className="grid grid-cols-[80px_1fr] items-start gap-4 border-b border-border py-5 lg:grid-cols-[120px_1fr_auto] lg:items-center lg:gap-6 lg:py-6"
                  >
                    <ListingPhoto src={item.photos[0]} alt="" label="photo" className="h-15 w-20 lg:h-22.5 lg:w-30" />
                    <div className="flex flex-col gap-1.5">
                      <Link
                        href={listingHref(item.slug)}
                        className="font-display text-body-lg font-semibold text-heading hover:underline"
                      >
                        {item.model}
                      </Link>
                      <span className="font-mono text-meta text-ink-muted">
                        {item.category.toLowerCase() === "accessories"
                          ? "accessory"
                          : `UK-used · ${item.grade}${item.hasBattery === false ? "" : ` · battery ${item.batteryHealth}%`}`}
                      </span>
                      {sold && (
                        <span className="text-body-sm font-medium text-warning">
                          No longer available. Another order reserved it first.
                        </span>
                      )}
                      <span className="font-mono text-body font-medium text-ink lg:hidden">
                        {formatCedis(item.pricePesewas)}
                      </span>
                      <RemoveFromCart listingId={item.id} model={item.model} />
                    </div>
                    <span
                      className={
                        "hidden justify-self-end font-mono text-price font-medium lg:block " +
                        (sold ? "text-ink-muted line-through" : "text-ink")
                      }
                    >
                      {formatCedis(item.pricePesewas)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="pt-6 text-body-sm text-ink-secondary">
              Each listing is one specific device we&rsquo;ve checked, so there&rsquo;s one of each.{" "}
              <Link href={shopUrl.home} className="font-medium whitespace-nowrap text-primary hover:underline">
                Continue shopping <InlineArrow />
              </Link>
            </p>
          </div>

          <aside
            aria-labelledby="summary-heading"
            className="flex flex-col self-start rounded-md border border-border bg-surface p-5 lg:p-7"
          >
            <h2 id="summary-heading" className="mb-2 font-display text-h2 text-heading">
              Order summary
            </h2>
            <dl>
              <SummaryRow label="Subtotal" value={formatCedis(subtotal)} />
              <SummaryRow
                label="Delivery"
                value={free ? "Free" : "By region, at checkout"}
                tone={free ? "free" : "muted"}
              />
              {free && <SummaryTotal value={formatCedis(subtotal)} />}
            </dl>
            {available.length > 0 ? (
              <Link
                href={shopUrl.checkout}
                className={buttonClass({ size: "lg", full: true, className: "mt-3" })}
              >
                Continue to checkout
              </Link>
            ) : (
              <p className="mt-3 text-body text-ink-secondary">Remove the unavailable items to continue.</p>
            )}
            <p className="mt-3 text-body-sm text-ink-muted">
              No account needed. Delivery is free on orders over {threshold}, and store pickup is always free.
            </p>
          </aside>
        </section>
      )}
    </>
  );
}
