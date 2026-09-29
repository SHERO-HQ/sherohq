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
    <section className="container-site flex flex-col gap-6 lg:gap-7 py-section">
      <h1 className="font-display text-h1 text-heading">
        Track your order
      </h1>
      <p className="max-w-measure text-body lg:text-body-lg text-ink-secondary">
        Enter the order number from your WhatsApp message and the phone number you ordered with. No account needed.
      </p>
      <TrackOrder initialNumber={initialNumber} />
    </section>
  );
}
