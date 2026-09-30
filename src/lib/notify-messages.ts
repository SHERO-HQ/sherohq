// The emails SHERO sends itself when someone orders, books a consultation or
// joins a waitlist. Pure, so the wording is tested; sending is in notify.ts.
// Plain text: they're read on a phone, and a link opens the record in the admin.
import { contactOptions, needOptions } from "@/lib/forms/consultation";
import { formatCedis } from "@/lib/orders";

export type NotificationKind = "orders" | "consultations" | "waitlists";

export type OwnerNotification =
  | {
      kind: "orders";
      id: string;
      number: string;
      customerName: string;
      items: string[];
      totalPesewas: number;
      feePending: boolean;
      delivery: "tamale" | "bus" | "pickup";
      region: string | null;
      town: string | null;
      payment: string;
    }
  | {
      kind: "consultations";
      id: string;
      name: string;
      phone: string;
      email: string | null;
      business: string | null;
      need: string;
      contactMethod: string;
      message: string | null;
    }
  | {
      kind: "waitlists";
      product: string;
      productSlug: string;
      name: string;
      phone: string;
      business: string;
      detailLabel: string;
      detail: string;
      total: number;
    };

export type Email = { subject: string; text: string };

const labelOf = (options: ReadonlyArray<{ value: string; label: string }>, value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

function where(n: Extract<OwnerNotification, { kind: "orders" }>): string {
  if (n.delivery === "pickup") return "Store pickup";
  const place = [n.town, n.region].filter(Boolean).join(", ");
  return `${n.delivery === "bus" ? "Bus to" : "Tamale delivery,"} ${place}`.trim();
}

/** The email for one event. `adminBase` is the admin's address, e.g. https://admin.sherohq.com/admin. */
export function notificationEmail(n: OwnerNotification, adminBase: string): Email {
  switch (n.kind) {
    case "orders":
      return {
        subject: `New order ${n.number}: ${formatCedis(n.totalPesewas)}${n.feePending ? " + delivery" : ""}`,
        text: [
          `${n.customerName} placed order ${n.number}.`,
          "",
          ...n.items,
          "",
          `${where(n)}${n.feePending ? " (delivery fee to agree on WhatsApp before dispatch)" : ""}`,
          `Payment: ${n.payment}`,
          `Total: ${formatCedis(n.totalPesewas)}${n.feePending ? " before delivery" : ""}`,
          "",
          `Open the order: ${adminBase}/orders/${n.id}`,
        ].join("\n"),
      };
    case "consultations": {
      const need = labelOf(needOptions, n.need);
      return {
        subject: `Consultation request: ${need}`,
        text: [
          `${n.name}${n.business ? ` (${n.business})` : ""} asked for a consultation.`,
          "",
          `Needs: ${need}`,
          `Prefers: ${labelOf(contactOptions, n.contactMethod)}`,
          `Phone: ${n.phone}`,
          ...(n.email ? [`Email: ${n.email}`] : []),
          ...(n.message ? ["", n.message] : []),
          "",
          `Open the request: ${adminBase}/consultations?id=${n.id}`,
        ].join("\n"),
      };
    }
    case "waitlists":
      return {
        subject: `${n.product} waitlist: ${n.name}`,
        text: [
          `${n.name} (${n.business}) joined the ${n.product} waitlist.`,
          "",
          `Phone: ${n.phone}`,
          `${n.detailLabel}: ${n.detail}`,
          "",
          `${n.total} ${n.total === 1 ? "person is" : "people are"} on the list now.`,
          `Open the list: ${adminBase}/waitlists?product=${n.productSlug}`,
        ].join("\n"),
      };
  }
}
