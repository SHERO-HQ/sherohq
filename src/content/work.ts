import type { WorkItem } from "./types";

/**
 * Only production work with client permission appears here: TrustCircle
 * (for Samakose), Tastea and Dajrim. Text comes from the owner; until it is
 * supplied the fields stay null and the UI shows a clear placeholder.
 */
export const work: readonly WorkItem[] = [
  { slug: "trustcircle", name: "TrustCircle", client: "Samakose", summary: null, challenge: null, whatWeBuilt: null },
  { slug: "tastea", name: "Tastea", summary: null, challenge: null, whatWeBuilt: null },
  { slug: "dajrim", name: "Dajrim", summary: null, challenge: null, whatWeBuilt: null },
];

export function getWork(slug: string): WorkItem | undefined {
  return work.find((w) => w.slug === slug);
}
