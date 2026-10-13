/** Content model. Pages render these; they never hard-code business facts. */

export type Service = {
  id: "software" | "managed-it" | "integrations" | "hardware";
  index: string;
  name: string;
  summary: string;
  forWho: string;
  includes: readonly string[];
  howItStarts: string;
  /** Optional external destination (e.g. hardware now lives on Merchander). */
  href?: string;
};

export type ProductStatus = "in-development" | "in-validation" | "live";

export type Product = {
  slug: "merchander" | "pharmasyst";
  name: string;
  status: ProductStatus;
  forWho: string;
  problem: string;
  willDo: readonly string[];
  waitlistMessage: string;
};

export type WorkItem = {
  slug: string;
  name: string;
  client?: string;
  /** Owner-supplied one-liner. `null` until supplied; never invented. */
  summary: string | null;
  challenge: string | null;
  whatWeBuilt: string | null;
  link?: string;
};

export type NavItem = { label: string; href: string };
