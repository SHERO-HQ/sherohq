import { missing, type Content } from "@/lib/content";

// Client work SHERO may show; permission granted for all three (PRD).
// Later this moves to the admin's Work section. TODO(owner): fill every missing().

export type Project = {
  slug: string;
  name: string;
  client: Content;
  /** One line for the Work page. */
  summary: Content;
  built: Content;
  year: Content;
  /** Live link; the "Visit" link is hidden until there is one. */
  url: string | null;
  outcome: Content;
  problem: Content;
  solution: Content;
  result: Content;
  /** Shown only if the client gives one in their own words. */
  quote: { text: string; attribution: string } | null;
};

export const projects: Project[] = [
  {
    slug: "trustcircle",
    name: "TrustCircle",
    client: "Samakose",
    summary: missing("One line: the problem TrustCircle solves for its users"),
    built: missing("Web app · mobile app · dashboard"),
    year: missing("2025"),
    url: null,
    outcome: missing("One-sentence outcome: what TrustCircle made possible for Samakose."),
    problem: missing("What Samakose was dealing with before. Two or three plain sentences, in their words where possible."),
    solution: missing("What SHERO built and why it was designed that way. Name the parts people actually use."),
    result: missing(
      "What changed after launch: something concrete and true, such as how many people use it, time saved, or what they can now do.",
    ),
    quote: null,
  },
  {
    slug: "tastea",
    name: "Tastea",
    client: missing("Client name"),
    summary: missing("One line: what Tastea's system lets them do, e.g. take and manage orders"),
    built: missing("Online ordering · order management"),
    year: missing("Year"),
    url: null,
    outcome: missing("One-sentence outcome: what the system made possible for Tastea."),
    problem: missing("What Tastea was dealing with before, in two or three plain sentences."),
    solution: missing("What SHERO built and why. Name the parts people actually use."),
    result: missing("What changed after launch: concrete and true."),
    quote: null,
  },
  {
    slug: "dajrim",
    name: "Dajrim",
    client: missing("Client name"),
    summary: missing("One line: the problem Dajrim's system solves"),
    built: missing("What we built"),
    year: missing("Year"),
    url: null,
    outcome: missing("One-sentence outcome: what the system made possible for Dajrim."),
    problem: missing("What Dajrim was dealing with before, in two or three plain sentences."),
    solution: missing("What SHERO built and why. Name the parts people actually use."),
    result: missing("What changed after launch: concrete and true."),
    quote: null,
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
