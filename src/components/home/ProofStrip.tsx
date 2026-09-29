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
    <>
      <section
        aria-label="Clients"
        className="flex flex-col gap-3.5 px-5 py-7 lg:flex-row lg:items-center lg:gap-12 lg:border-t lg:border-border lg:px-20"
      >
        <h2 className="shrink-0 font-mono text-xs/4 font-normal text-ink-muted">we&rsquo;ve worked with</h2>
        <ul className="grid flex-1 grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-8">
          {clients.map((client) => (
            <li
              key={client}
              className="flex h-[52px] items-center justify-center rounded-sm border border-border font-display text-lg/6 font-semibold tracking-[-0.01em] text-ink-secondary lg:h-12 lg:text-xl/6"
            >
              {client}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="How buying from SHERO works" className="container-site">
        <dl className="grid grid-cols-2 border-t border-rule-strong lg:grid-cols-4 lg:border-b lg:border-border">
          {facts.map((fact, i) => (
            <div
              key={fact.label}
              className={
                "flex flex-col gap-1.5 border-b border-border py-4 lg:gap-2 lg:border-b-0 lg:pt-5 lg:pb-[22px] " +
                (i % 2 === 0 ? "pr-3 " : "border-l pl-3 ") +
                (i === 0 ? "lg:pr-6 lg:pl-0" : "lg:border-l lg:px-6")
              }
            >
              <dt className="font-mono text-xs/4 text-ink-muted">{fact.label}</dt>
              <dd className="text-sm/5 font-medium text-ink lg:text-base/6">
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
    </>
  );
}
