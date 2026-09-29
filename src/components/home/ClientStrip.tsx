import { LogoCycle } from "@/components/ui/LogoCycle";

// Clients whose work SHERO may show (permissions granted, per the PRD).
// Set as plain type until the real logos arrive; swap in logos then.
const clients = ["Samakose", "TrustCircle", "Tastea", "Dajrim"];

/**
 * Clients, Clerk style: a line of text beside one row of names on large
 * screens, above a two-column grid on phones. Spots swap names when there
 * are more clients than spots (phones now; large screens from the fifth).
 */
export function ClientStrip() {
  return (
    <section aria-labelledby="clients-heading" className="container-site pb-4">
      <div className="flex flex-col gap-4 border-y border-border py-8 lg:flex-row lg:items-center lg:gap-12">
        <h2 id="clients-heading" className="shrink-0 text-body-sm text-ink-muted lg:w-48">
          We&rsquo;ve worked with
        </h2>
        <LogoCycle items={clients} />
      </div>
    </section>
  );
}
