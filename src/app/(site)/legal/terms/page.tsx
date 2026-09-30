import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { Fill } from "@/components/ui/Fill";
import { missing } from "@/lib/content";
import { business, routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for buying from the SHERO shop and working with SHERO: orders, payment, delivery and warranty.",
  alternates: { canonical: routes.terms },
};

// Only facts already agreed in docs/prd.md and CLAUDE.md; anything else is
// missing() for the owner and a lawyer to supply. Never invent legal terms.
export default function TermsPage() {
  const link = "font-medium text-primary underline underline-offset-3";
  return (
    <LegalPage
      title="Terms"
      current={routes.terms}
      updated={missing("date")}
      intro={
        <p>
          These terms cover buying from the SHERO shop and working with SHERO. SHERO HQ is a brand of SHERO FINTECH.
        </p>
      }
      sections={[
        {
          id: "orders",
          title: "Orders",
          body: (
            <p>
              You don&rsquo;t need an account to order. After you order, we send your order number; track it with that
              number and your phone number on the{" "}
              <Link href={routes.track} className={link}>
                Track Order page
              </Link>
              . <Fill value={missing("What happens if an item sells out after you order, and how cancellations work")} scale={1} />
            </p>
          ),
        },
        {
          id: "devices",
          title: "Devices",
          body: (
            <p>
              Devices in the shop are UK-used and refurbished, not new. Each one is tested, cleaned and reset before
              it&rsquo;s listed, and its listing shows the battery health and grade.
            </p>
          ),
        },
        {
          id: "payment",
          title: "Prices and payment",
          body: (
            <p>
              Prices are in Ghana cedis (GHS). You can pay in cash on delivery or when you pick up your order. When
              available, you can also pay by MoMo (MTN MoMo or Telecel Cash) through Hubtel or by card (Visa or
              Mastercard) through Paystack; checkout shows which options are open.
            </p>
          ),
        },
        {
          id: "delivery",
          title: "Delivery",
          body: (
            <p>
              We deliver nationwide. Delivery is free on orders over GHS 2,000. Orders placed before 5:00 PM go to the
              bus station the same day, and delivery usually takes 12–72 hours from dispatch.{" "}
              Below GHS 2,000, the delivery fee depends on your region and is shown at checkout before you pay.
              Store pickup is free.{" "}
              <Fill value={missing("Who is responsible once the parcel is at the station")} scale={1} />
            </p>
          ),
        },
        {
          id: "warranty",
          title: "Warranty",
          body: (
            <p>
              Every device has a one-week warranty from delivery. If something we tested stops working in that week,
              we&rsquo;ll repair or replace it. <Fill value={missing("What the warranty doesn't cover, and how to claim")} scale={1} />
            </p>
          ),
        },
        {
          id: "returns",
          title: "Returns and refunds",
          body: (
            <p>
              <Fill value={missing("Return window, condition, and how refunds are paid")} scale={1} />
            </p>
          ),
        },
        {
          id: "services",
          title: "Services and quotes",
          body: (
            <p>
              Consultations are free and carry no obligation. For software, IT and integration work we give a written
              quote before any work starts. <Fill value={missing("Payment schedule and what's included after hand-over")} scale={1} />
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          body: (
            <p>
              SHERO, {business.city} · {business.email} · {business.phoneDisplay}
            </p>
          ),
        },
      ]}
    />
  );
}
