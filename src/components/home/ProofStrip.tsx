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

export function ProofStrip() {
  return (
    <section aria-label="Clients and how buying works" className="border-y border-border bg-surface">
      <div className="container-site flex flex-col gap-6 py-8 lg:gap-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-baseline lg:gap-8">
          <h2 className="shrink-0 font-mono text-eyebrow text-ink-muted">we&rsquo;ve worked with</h2>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {clients.map((client) => (
              <li key={client} className="font-display text-h3 text-ink-secondary">
                {client}
              </li>
            ))}
          </ul>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 lg:grid-cols-4">
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
      </div>
    </section>
  );
}
