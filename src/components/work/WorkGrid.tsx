import type { WorkItem } from "@/content/types";
import { WorkCard } from "./WorkCard";

export function WorkGrid({ items, headingLevel }: { items: readonly WorkItem[]; headingLevel?: "h2" | "h3" }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((w) => (
        <li key={w.slug} className="flex">
          <WorkCard item={w} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
