/**
 * SHERO Knowledge Hub
 * 
 * Condensed catalog fallback, support knowledge, guide mappings,
 * and company information for the AI system prompt.
 * 
 * NOTE: The live catalog is fetched dynamically from the database.
 * CATALOG_SUMMARY is only used as a fallback when the DB is unreachable.
 */

export const CATALOG_SUMMARY = `
- Laptops:
  - HP Elitebook 840 G6 (3800 GHS): 8th Gen i5, 8GB RAM. Great student value.
  - HP ProBook (2800 GHS): Most affordable student option.
  - Dell Latitude 7490 (4500 GHS): High-quality business grade.
  - Dell Latitude 3120 G7 (2800 GHS): Compact and affordable.
  - Lenovo X1 Yoga (4500 GHS): High-performance 2-in-1 touchscreen.
  - HP Elitebook 1040 G8 (6100 GHS): Flagship business laptop.
- Other:
  - JBL Tour Pro 2 (500 GHS): Audio/ANC.
  - Samsung Type C Adapter (80 GHS).
`;

export const SUPPORT_KNOWLEDGE = `
TROUBLESHOOTING GUIDES
- Hardware/Power issues: Check the unboxing & power guide (setup-shero-laptop). If it won't boot, try a hard reset (hold power 15s).
- Software issues: See the Software Installation guide (software-installation-guide) for driver updates, OS reinstalls, and app setup.
- General crashing: If OS crashes repeatedly, use "Troubleshooting Power Issues" (troubleshooting-power) or escalate to a support ticket.
- Slow performance: Close heavy startup apps, clear temp files, check for malware, ensure 15%+ free disk space.
- Network issues: Restart router, check cable connections, verify ISP status, try alternate DNS (8.8.8.8).
- Overheating: Clean vents, use on hard surface, update BIOS/drivers, check fan with diagnostics.

COMMON QUESTIONS
- Business hours: Mon-Fri, 8:00 AM-6:00 PM.
- Anything not covered here (pricing, timelines, hardware requests, warranty, delivery): send the person to WhatsApp, https://wa.me/233548711582. Do not guess.

SERVICES OFFERED
- Custom Software Development: Tailored web and business applications.
- IT Setup & Support: Help setting up and supporting your business tools.
- Workflow & API Architecture: Connecting systems and automating work.
- Hardware: A service line only. Tell us what you need and we help source and set it up. No prices or online ordering.
`;

export const GUIDE_MAPPING = [
  {
    slug: "setup-shero-laptop",
    keywords: ["setup", "unboxing", "start", "new", "first time", "getting started", "configure"],
  },
  {
    slug: "software-installation-guide",
    keywords: ["install", "update", "software", "app", "driver", "program", "download", "reinstall", "windows"],
  },
  {
    slug: "troubleshooting-power",
    keywords: ["crash", "power", "boot", "battery", "dead", "black screen", "won't turn on", "shutdown", "restart loop", "blue screen", "bsod"],
  },
];

