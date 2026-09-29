import { Readout } from "@/components/ui/Readout";
import { formatCedis } from "@/lib/orders";
import { whatsappLink } from "@/lib/site";

/** "What Grade A++ means": the shop's standard, with the delivery and payment facts. */
export function GradeExplainer({ minBattery, thresholdPesewas }: { minBattery: number; thresholdPesewas: number }) {
  const facts = [
    { label: "warranty", text: "One week. We repair or replace anything we tested." },
    {
      label: "delivery",
      text: `Same day in Tamale. 12–72 hours elsewhere, by bus. Free over ${formatCedis(thresholdPesewas)}, or collect free from our store.`,
    },
    { label: "payment", text: "MoMo, card, cash on delivery, or pay when you collect." },
    {
      label: "not sure?",
      text: (
        <>
          Tell us your work and budget.{" "}
          <a
            href={whatsappLink("Hi SHERO, I'm looking for a laptop. My work and budget: ")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-3"
          >
            We&rsquo;ll recommend one, free.
          </a>
        </>
      ),
    },
  ];

  return (
    <section
      id="grade"
      aria-labelledby="grade-heading"
      className="scroll-mt-20 border-y border-border bg-surface py-14 lg:py-24"
    >
      <div className="container-site grid gap-10 lg:grid-cols-[1fr_460px] lg:gap-24">
        <div className="flex flex-col gap-5 lg:gap-6">
          <p className="font-mono text-xs/4 font-medium text-accent">grade a++</p>
          <h2
            id="grade-heading"
            className="font-display text-[30px]/[33px] font-bold tracking-[-0.02em] text-heading lg:text-[44px]/12 lg:tracking-[-0.025em]"
          >
            What Grade A++ means.
          </h2>
          <p className="max-w-[620px] text-base/[25px] text-ink-secondary lg:text-lg/7">
            UK-used: lightly used by a previous owner in the UK, not heavily worked. Neat and clean, with 90% or better
            cosmetic condition. Every device goes through the same check before it&rsquo;s listed.
          </p>
          <dl className="mt-2 grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:mt-3">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-1.5 border-t border-border pt-3.5">
                <dt className="font-mono text-xs/4 font-medium text-accent">{fact.label}</dt>
                <dd className="text-[15px]/[23px] text-ink">{fact.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:pt-[60px]">
          <Readout
            title="device check / grade a++"
            rows={[
              { label: "screen · keyboard · trackpad", value: "pass", tone: "done" },
              { label: "ports · speakers · camera", value: "pass", tone: "done" },
              { label: "wi-fi · charging", value: "pass", tone: "done" },
              { label: "battery health", value: `${minBattery}%+` },
              { label: "cosmetic condition", value: "90%+", tone: "done" },
              { label: "cleaned and reset", value: "done", tone: "done" },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
