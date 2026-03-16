/**
 * SHERO Knowledge Hub
 * Condensed catalog and support data to feed into the AI system prompt.
 * SYNCED WITH LIVE DB INVENTORY
 */

export const CATALOG_SUMMARY = `
- Laptops:
  - HP Elitebook 840 G6 (3800 GHS): 8th Gen i5, 8GB RAM. Great student value.
  - HP ProBook (2800 GHS): Most affordable student option.
  - Dell Latitude 7490 (4500 GHS): High-quality business grade.
  - Dell Latitude 3120 G7 (2800 GHS): Compact and affordable.
  - Lenovo X1 Yoga (4500 GHS): Premium 2-in-1 touchscreen.
  - HP Elitebook 1040 G8 (6100 GHS): Premium professional.
- Other:
  - JBL Tour Pro 2 (500 GHS): Audio/ANC.
  - Samsung Type C Adapter (80 GHS).
`;

export const SUPPORT_KNOWLEDGE = `
- Hardware/Power issues: Check unboxing/power guide (setup-shero-laptop). If it won't boot, try hard reset.
- Software issues: See Software Installation guide (software-installation-guide).
- General crashing: If OS crashes, recommend "Troubleshooting Power Issues" (troubleshooting-power) or creating a ticket.
`;

export const GUIDE_MAPPING = [
  { slug: "setup-shero-laptop", keywords: ["setup", "unboxing", "start", "new"] },
  { slug: "software-installation-guide", keywords: ["install", "update", "software", "app"] },
  { slug: "troubleshooting-power", keywords: ["crash", "power", "boot", "battery", "dead", "black screen"] },
];
