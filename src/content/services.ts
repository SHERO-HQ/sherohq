import type { Service } from "./types";

export const services: readonly Service[] = [
  {
    id: "software",
    index: "01",
    name: "Custom software",
    summary: "Web and business applications built around how you actually work.",
    forWho: "Businesses and organisations whose spreadsheets, paper or off-the-shelf tools no longer fit.",
    includes: ["Scoping the problem with you", "Design and build", "Launch and handover", "Ongoing fixes and changes"],
    howItStarts: "A free consultation where you tell us what's slowing you down.",
  },
  {
    id: "managed-it",
    index: "02",
    name: "Managed IT",
    summary: "Setup, networks and ongoing support, on site or remote.",
    forWho: "Offices, shops and organisations that need their computers and network to just work.",
    includes: ["Device and network setup", "Routine maintenance", "On-site and remote troubleshooting"],
    howItStarts: "We visit or call, look at your setup, and tell you plainly what it needs.",
  },
  {
    id: "integrations",
    index: "03",
    name: "Integrations",
    summary: "Connecting payments, business tools and backend services.",
    forWho: "Teams whose tools don't talk to each other, or who need payments wired in.",
    includes: ["Payment gateway setup", "Connecting business tools", "APIs between your systems"],
    howItStarts: "Tell us which tools you use and what should happen between them.",
  },
  {
    id: "hardware",
    index: "04",
    name: "Hardware",
    summary: "Tested refurbished laptops, now sold through Merchander.",
    forWho: "People and businesses who want a reliable laptop without paying for new.",
    includes: ["Inspected before sale", "Battery health of 90% or more", "Delivery across Ghana"],
    howItStarts: "Browse and order through Merchander.",
    href: "/merchander",
  },
];
