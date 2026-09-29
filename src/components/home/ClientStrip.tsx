import { Marquee } from "@/components/ui/Marquee";

// Clients whose work SHERO may show (permissions granted, per the PRD).
// Set as plain type until the real logos arrive; swap in logos then.
const clients = ["Samakose", "TrustCircle", "Tastea", "Dajrim"];

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
