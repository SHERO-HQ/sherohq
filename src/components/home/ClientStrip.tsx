import { LogoCycle } from "@/components/ui/LogoCycle";
import { getClientNames } from "@/lib/work";

/**
 * Clients, Clerk style: tinted lines run the full width of the screen above
 * and below, with a line between the text and each name. The text sits
 * beside the row on large screens, above a two-column grid on phones. Spots
 * swap names when there are more clients than spots (phones now; large
 * screens from the fifth).
 */
export async function ClientStrip() {
  // Clients and projects from the admin's Work section, shown with permission.
  // Set as plain type until the real logos arrive.
  const clients = await getClientNames();
  if (clients.length === 0) return null;
  return (
    <section aria-labelledby="clients-heading" className="border-y border-border-subtle">
      {/* On phones the grid runs edge to edge, so every line crosses the whole screen. */}
      <div className="flex flex-col lg:container-site lg:flex-row">
        <h2
          id="clients-heading"
          className="flex shrink-0 items-center border-b border-border-subtle px-gutter py-4 text-body-sm text-ink-muted lg:w-56 lg:border-r lg:border-b-0 lg:pr-6 lg:pl-0"
        >
          We&rsquo;ve worked with
        </h2>
        <LogoCycle items={clients} />
      </div>
    </section>
  );
}
