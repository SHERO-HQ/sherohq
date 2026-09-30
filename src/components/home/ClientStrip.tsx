import { LogoCycle } from "@/components/ui/LogoCycle";

// Clients whose work SHERO may show (permissions granted, per the PRD).
// Set as plain type until the real logos arrive; swap in logos then.
const clients = ["Samakose", "TrustCircle", "Tastea", "Dajrim"];

/**
 * Clients, Clerk style: full-width lines above and below, each name in its
 * own cell with a line between; the text beside the row on large screens,
 * above a two-column grid on phones. Spots swap names when there
 * are more clients than spots (phones now; large screens from the fifth).
 */
export function ClientStrip() {
  return (
    // The lines run the full width of the screen; the cells sit in the container.
    <section aria-labelledby="clients-heading" className="border-y border-border">
      <div className="container-site">
        <div className="flex flex-col lg:flex-row lg:border-x lg:border-border">
          <h2
            id="clients-heading"
            className="flex shrink-0 items-center border-b border-border py-4 text-body-sm text-ink-muted lg:w-56 lg:border-r lg:border-b-0 lg:px-6"
          >
            We&rsquo;ve worked with
          </h2>
          <LogoCycle items={clients} />
        </div>
      </div>
    </section>
  );
}
