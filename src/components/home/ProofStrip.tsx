import { Marquee } from "@/components/ui/Marquee";
import { business } from "@/lib/site";

// Clients whose work SHERO may show (permissions granted, per the PRD).
// Set as plain type until the real logos arrive; swap in logos then.
const clients = ["Samakose", "TrustCircle", "Tastea", "Dajrim"];

const facts = [
  { label: "delivery", value: "Free nationwide over GHS 2,000" },
  {
    label: "payment",
    value: "MoMo · card · cash on delivery or pickup",
    valueMobile: "MoMo, card, cash on delivery or at pickup",
  },
  {
    label: "warranty",
    value: "One week on every device, plus free support",
    valueMobile: "One week, plus free support",
  },
  { label: "hours", value: business.hours },
];

/** Clients, Clerk style: a small centred label over a slow scrolling row. */
export function ClientStrip() {
  return (
    <section aria-labelledby="clients-heading" className="container-site flex flex-col items-center gap-5 pb-section">
      <h2 id="clients-heading" className="font-mono text-eyebrow text-ink-muted">
        we&rsquo;ve worked with
      </h2>
      {/* Narrow while there are few clients, so no name shows twice at once.
          TODO(owner): with 6–8 logos, widen it (or drop the max width). */}
      <Marquee items={clients} className="w-full max-w-xl" />
    </section>
  );
}

/** How buying from SHERO works: delivery, payment, warranty and hours. */
export function BuyingFacts() {
  return (
    <section aria-label="How buying from SHERO works" className="border-y border-border bg-surface">
      <dl className="container-site grid grid-cols-2 gap-x-6 gap-y-5 py-8 lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-1">
            <dt className="font-mono text-meta text-ink-muted">{fact.label}</dt>
            <dd className="text-body-sm font-medium text-ink">
              {fact.valueMobile ? (
                <>
                  <span className="lg:hidden">{fact.valueMobile}</span>
                  <span className="hidden lg:inline">{fact.value}</span>
                </>
              ) : (
                fact.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
