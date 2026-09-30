import { Check } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { formatCedis } from "@/lib/orders";
import { paymentSummary } from "@/lib/payments";

/** "What Grade A++ means": the shop's standard, with the warranty, delivery and payment facts. */
export function GradeExplainer({ minBattery, thresholdPesewas }: { minBattery: number; thresholdPesewas: number }) {
  const facts = [
    { label: "warranty", text: "One week. We repair or replace anything we tested." },
    {
      label: "delivery",
      text: `Same day in Tamale. 12–72 hours elsewhere in Ghana, by bus. Free over ${formatCedis(thresholdPesewas)}, or collect free from our store. Bulk orders outside Ghana: ask us for a quote.`,
    },
    { label: "payment", text: paymentSummary() },
  ];

  const standard = [
    "Screen, keyboard and trackpad",
    "Ports, speakers and camera",
    "Wi-Fi and charging",
    `Battery health ${minBattery}% or more, if it has a battery`,
    "Cosmetic condition 90% or better",
    "Cleaned and reset to factory settings",
  ];

  return (
    <Section id="grade" tone="surface" className="scroll-mt-16" aria-labelledby="grade-heading">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-20">
        <div>
          <SectionHeader
            id="grade-heading"
            title="What Grade A++ means."
            intro="UK-used: lightly used by a previous owner in the UK, not heavily worked. Neat and clean, and checked the same way before it’s listed."
            className="lg:mb-10"
          />
          <dl className="grid gap-y-6 md:grid-cols-3 md:gap-x-8">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-1 border-t border-border pt-4">
                <dt className="font-mono text-eyebrow text-secondary">{fact.label}</dt>
                <dd className="text-body text-ink">{fact.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="self-end rounded-md border border-border bg-surface-raised p-6">
          <h3 className="text-h3">Checked on every device</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {standard.map((item) => (
              <li key={item} className="flex items-start gap-3 text-body-sm text-ink">
                <Check aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-secondary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
