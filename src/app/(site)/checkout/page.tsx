import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { CART_COOKIE, parseCart } from "@/lib/cart";
import { getDeliveryRates, getListingsByIds, getShopSettings, onlinePayments } from "@/lib/shop";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const ids = parseCart((await cookies()).get(CART_COOKIE)?.value);
  const [rows, settings, rates] = await Promise.all([getListingsByIds(ids), getShopSettings(), getDeliveryRates()]);
  const items = ids
    .map((id) => rows.find((row) => row.id === id))
    .filter((row) => row !== undefined)
    .map((row) => ({ id: row.id, model: row.model, pricePesewas: row.pricePesewas, status: row.status }));

  // Anything sold or reserved since it was added is sorted out on the cart page.
  if (items.length === 0 || items.some((item) => item.status !== "in_stock")) redirect(routes.cart);

  return (
    <>
      <section className="container-site flex flex-col gap-3 pt-10 pb-4 lg:pt-[72px] lg:pb-6">
        <h1 className="font-display text-[38px]/[40px] font-bold tracking-[-0.03em] text-heading lg:text-[56px]/[58px] lg:tracking-[-0.035em]">
          Checkout
        </h1>
        <p className="font-mono text-[13px]/[17px] text-ink-secondary">no account needed · pay how you prefer</p>
      </section>
      <div className="container-site pt-2 pb-20 lg:pt-4 lg:pb-[120px]">
        <CheckoutForm
          items={items}
          thresholdPesewas={settings.freeDeliveryThresholdPesewas}
          rates={rates}
          online={onlinePayments()}
        />
      </div>
    </>
  );
}
