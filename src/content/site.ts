export const site = {
  name: "SHERO",
  url: "https://sherohq.com",
  motto: "Redefine Possible.",
  description:
    "SHERO is a technology company in Tamale, Ghana. We build software, set up and look after IT, connect business tools, and build our own products for social sellers and pharmacies.",
  location: "Tamale, Ghana",
  hours: { days: "Mon–Fri", open: "8:00", close: "18:00", long: "Monday to Friday, 8:00 to 18:00 GMT" },
  email: "info@sherohq.com",
  whatsapp: { number: "233548711582", display: "+233 54 871 1582" },
  legalLine: "SHERO HQ is a brand of SHERO FINTECH.",
} as const;

/** WhatsApp click-to-chat link with an optional prefilled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
