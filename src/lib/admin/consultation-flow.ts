// Consultation requests in the admin: the steps, the tabs and the ways to
// reply. Pure, so they're tested.
import { contactOptions, needOptions } from "@/lib/forms/consultation";

export const consultationSteps = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "call_held", label: "Call held" },
  { value: "quoted", label: "Quoted" },
  { value: "won", label: "Won" },
  { value: "closed", label: "Closed" },
] as const;

export type ConsultationStatus = (typeof consultationSteps)[number]["value"];

export const consultationTabs = [
  { value: "open", label: "Open", statuses: ["new", "contacted", "call_held", "quoted"] },
  { value: "won", label: "Won", statuses: ["won"] },
  { value: "closed", label: "Closed", statuses: ["closed"] },
] as const satisfies ReadonlyArray<{ value: string; label: string; statuses: readonly ConsultationStatus[] }>;

export type ConsultationTab = (typeof consultationTabs)[number]["value"];

export const stepLabel = (status: ConsultationStatus) => consultationSteps.find((s) => s.value === status)!.label;
export const needLabel = (need: string) => needOptions.find((n) => n.value === need)?.label ?? need;
export const contactLabel = (method: string) => contactOptions.find((c) => c.value === method)?.label ?? method;

export function isConsultationStatus(value: string): value is ConsultationStatus {
  return consultationSteps.some((s) => s.value === value);
}

/** A first reply, ready to send on WhatsApp: it names what they asked about, nothing more. */
export function consultationReply(c: { name: string; need: string }): string {
  const first = c.name.trim().split(/\s+/)[0];
  const need = needLabel(c.need).toLowerCase();
  return c.need === "unsure"
    ? `Hello ${first}, this is SHERO. Thanks for your consultation request. When is a good time to talk about what you need?`
    : `Hello ${first}, this is SHERO. Thanks for your consultation request about ${need}. When is a good time to talk?`;
}
