import type { WorkItem } from "./types";

const STORAGE = "https://uydnijaimlpxqwnabfce.supabase.co/storage/v1/object/public/products";

/**
 * Only production work with client permission appears here: TrustCircle
 * (for Samakose), Tastea and Dajrim. The text is the owner's own, copied from
 * the current sherohq.com project records. Edit it there or here, never invent it.
 */
export const work: readonly WorkItem[] = [
  {
    slug: "tastea",
    name: "Tastea",
    client: "Tastea Brand",
    category: "Custom Software",
    status: "live",
    link: "https://tasteagh.com",
    stack: ["NextJS", "Vercel", "Supabase", "TailwindCSS v4", "Zod", "Drizzle ORM"],
    image: { src: `${STORAGE}/817dd461-2104-47ce-925b-b1e9b36092ca.jpg`, alt: "Tastea's online ordering site" },
    challenge:
      "Tastea is a local drinks brewery that sells on a pre-order basis: customers order ahead, and the brewery makes and delivers to match. Handling that by phone, chat and notebook gets hard quickly. Orders arrive in different places, it’s unclear how much to brew against what has been ordered, and delivery runs from lists that are easy to lose. Without one record, working out what has been sold, what is still owed and what has come in is slow and often wrong.\n\nThe brewery needed a system made for pre-orders and for the way local deliveries work, not a general online shop built around products sitting on a shelf.",
    whatWeBuilt:
      "SHERO built Tastea’s commerce system from scratch. It lets the brewery:\n\n1. Take customer orders online, so every pre-order is recorded in one place instead of across chats and calls.\n2. Manage inventory, keeping track of what is available against what has been ordered.\n3. Organise deliveries, with each order tracked from placement to handover.\n4. Track revenue, so the owner can see what has been sold and what has been paid.\n5. Take payments online through Hubtel, so a customer can pay when they order and the payment is recorded against the order.",
  },
  {
    slug: "trustcircle",
    name: "TrustCircle",
    client: "Samakose AccLab",
    category: "Custom Software",
    status: "live",
    link: "https://trustcirclegh.org",
    stack: ["NextJS", "TailwindCSS", "PostgreSQL"],
    image: { src: `${STORAGE}/139256ba-b127-4212-97d2-7c887243dbbb.svg`, alt: "The TrustCircle mark", fit: "contain" },
    challenge:
      "Small businesses, traders, artisans, women entrepreneurs and youth-led enterprises in the Tamale Metropolitan Area and Sagnarigu Municipality often cannot get credit that fits how they work. Quick-loan schemes lend without structure, and repayment suffers. The programme behind Trust Circle is not a quick loan. It is a structured path for serious entrepreneurs, built on accountability and long-term growth. Running a revolving fund like this by hand makes it hard to see who has borrowed, who has repaid, and whether the fund is staying healthy.",
    whatWeBuilt:
      "Trust Circle is a community-based revolving credit and enterprise growth initiative that promotes financial inclusion while keeping strong repayment discipline. SHERO is building the system behind it: member records, loan cycles, repayment tracking, fund balance reporting. The aim is that each borrower’s progress and the fund’s performance are recorded in one place.",
  },
  {
    slug: "dajrim",
    name: "Dajrim",
    client: "Dajrim Foundation",
    category: "Web Development",
    status: "live",
    link: "https://dajrim.org",
    stack: ["Astro", "TailwindCSS", "Content + CMS"],
    image: { src: `${STORAGE}/36b2b85a-cd11-48c5-939c-e92e53e648c5.png`, alt: "The Dajrim Foundation website" },
    challenge:
      "Dajrim Foundation needed a place online where people could learn who it is and what it does. Without a site, its work was only visible through social posts and word of mouth, which made it hard for supporters, partners and the community to find or trust it. The site had to be simple to run, fast to load on mobile connections, and easy to add news and updates to, without needing a developer for every post.",
    whatWeBuilt:
      "We built a static website and portfolio for the foundation. It presents the foundation’s work in one place: Story, What They Do, Impact, Gallery, Voices, Contact and Partnerships. The team can publish news and posts and share them on social media. Because it is a static site, it loads quickly, costs little to host, and does not depend on a database to stay online.",
  },
];

export function getWork(slug: string): WorkItem | undefined {
  return work.find((w) => w.slug === slug);
}

/** The first sentence of the challenge, for cards and meta descriptions. */
export function workSummary(item: WorkItem): string {
  const first = item.challenge.split(/(?<=\.)\s/)[0] ?? item.challenge;
  return first.trim();
}
