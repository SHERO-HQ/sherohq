export const SERVICE_TITLE_MAP: Record<string, string> = {
  software: "Software Engineering",
  "it-support": "Managed IT Support",
  "managed-it": "Managed IT Support",
  infrastructure: "Infrastructure & Systems",
  hardware: "Hardware & POS Setups",
  cybersecurity: "Cyber Security & Audits",
  other: "Custom Solutions Consultation",
};

export function getServiceDisplayTitle(service?: string | null): string {
  if (!service) return "General Consultation";
  const normalized = service.trim().toLowerCase();
  return SERVICE_TITLE_MAP[normalized] || service;
}
