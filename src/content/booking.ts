/** Consultation page copy and booking options, carried over from the previous site. */
export const booking = {
  hero: {
    title: ["Accelerate Your", "Technical Vision"],
    body: "Book a focused session to align technology decisions, delivery timelines, and growth priorities with your team. Turn complex challenges into actionable roadmaps.",
  },
  session: { name: "Strategy Session", length: "30 Min", format: "Video Call" },
  framework: {
    title: "Focused Expertise, Actionable Outcomes",
    body: "Our 30-minute discovery sessions are designed to isolate technical bottlenecks and map out a localized deployment strategy.",
    topics: [
      {
        title: "Procurement Strategy",
        body: "Optimizing supply chains for business hardware and specialized technical equipment sourcing.",
      },
      {
        title: "System Architecture",
        body: "Designing resilient software and hardware stacks for high-growth, high-availability environments.",
      },
      {
        title: "Logistics Planning",
        body: "Structuring efficient delivery and deployment protocols across complex regional territories.",
      },
    ],
  },
  schedule: {
    title: "Schedule A Session",
    body: "Select a time that works for your stakeholders.",
  },
  services: [
    { id: "it-support", title: "IT Support", description: "Helpdesk and hands-on system support." },
    { id: "infrastructure", title: "Infrastructure & Systems", description: "Server and network setup." },
    {
      id: "hardware",
      title: "Hardware & POS Setups",
      description: "Strategic planning and configuration of physical hardware systems.",
    },
    { id: "software", title: "Software Engineering", description: "Custom web, mobile, and SaaS application development." },
    { id: "other", title: "Other", description: "Something else? Let's discuss your unique requirements." },
  ],
  /** Older links use these ids; they map onto the services above. */
  serviceAliases: { "managed-it": "it-support" } as Record<string, string>,
  /**
   * Session start times in Accra time (GMT). Every 30-minute session ends
   * inside working hours, Mon–Fri 8:00–18:00.
   */
  slots: {
    Morning: ["09:00", "10:00", "11:00", "11:30"],
    Afternoon: ["13:00", "14:00", "15:00", "16:00", "17:00"],
  },
} as const;

export type BookingServiceId = (typeof booking.services)[number]["id"];
