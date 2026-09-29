import type { Metadata } from "next";
import { TrackOrder } from "@/components/shop/TrackOrder";
import { normaliseOrderNumber } from "@/lib/orders";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Track a SHERO order with your order number and the phone number you ordered with. No account needed.",
  alternates: { canonical: routes.track },
};

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ n?: string | string[] }> }) {
  const n = (await searchParams).n;
  const initialNumber = typeof n === "string" ? (normaliseOrderNumber(n) ?? undefined) : undefined;

  return (
    <section className="container-site flex flex-col gap-6 pt-10 pb-20 lg:gap-7 lg:pt-20 lg:pb-28">
      <h1 className="font-display text-[38px]/[40px] font-bold tracking-[-0.03em] text-heading lg:text-[56px]/[58px] lg:tracking-[-0.035em]">
        Track your order
      </h1>
      <p className="max-w-[620px] text-base/[26px] text-ink-secondary lg:text-[19px]/[30px]">
        Enter the order number from your WhatsApp message and the phone number you ordered with. No account needed.
      </p>
      <TrackOrder initialNumber={initialNumber} />
    </section>
  );
}
