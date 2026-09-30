// How an order moves through the admin, one step at a time, and the WhatsApp
// message for each step (Phase 1: sent by hand from the business app). The
// customer-facing wording matches Track Order (statusLabel in orders.ts).
import { formatGhanaDate } from "@/lib/dates";
import { formatCedis, statusSteps, type DeliveryMethod, type OrderStatus } from "@/lib/orders";

export type FlowOrder = {
  number: string;
  customerName: string | null;
  deliveryMethod: DeliveryMethod;
  status: OrderStatus;
  region: string | null;
  town: string | null;
  pickupStation: string | null;
  paymentMethod: "momo" | "card" | "cash_on_delivery" | "pay_at_pickup";
  paymentStatus: "pending" | "paid" | "failed";
  totalPesewas: number;
  deliveryFeePending: boolean;
  warrantyEndsOn: string | null;
};

/** The next status for this delivery method, or null once it's done or cancelled. */
export function nextStatus(order: Pick<FlowOrder, "status" | "deliveryMethod">): OrderStatus | null {
  if (order.status === "cancelled") return null;
  const steps = statusSteps(order.deliveryMethod);
  const i = steps.indexOf(order.status);
  return i >= 0 && i < steps.length - 1 ? steps[i + 1] : null;
}

/** The button that moves an order to its next status. */
export function advanceLabel(next: OrderStatus, method: DeliveryMethod): string {
  switch (next) {
    case "confirmed":
      return "Confirm and mark packed";
    case "in_transit":
      return method === "bus" ? "Mark as sent to the station" : "Mark as out for delivery";
    case "arrived":
      return method === "tamale" ? "Mark as delivered" : "Mark as ready for pickup";
    default:
      return "Next step";
  }
}

const firstName = (name: string | null) => name?.trim().split(/\s+/)[0] ?? "there";

/** What the admin does next, in a sentence. */
export function nextStepHint(order: FlowOrder): string {
  const name = firstName(order.customerName);
  const next = nextStatus(order);
  if (order.status === "cancelled") return "This order is cancelled. Its devices are back in stock.";
  if (!next) return order.paymentStatus === "paid" ? "Done. Nothing left to do." : "Delivered. Mark the payment collected once it is.";
  if (blockedByFee(order)) return `Agree the delivery fee to ${order.region ?? "their region"} with ${name} on WhatsApp, then enter it below.`;
  switch (next) {
    case "confirmed":
      return `Check the devices, pack them, then confirm and message ${name}.`;
    case "in_transit":
      return order.deliveryMethod === "bus"
        ? `When the package is handed to the bus, mark it sent and message ${name}.`
        : `When it leaves for ${name}'s address, mark it out for delivery and message ${name}.`;
    case "arrived":
      return order.deliveryMethod === "tamale"
        ? `When ${name} has it, mark it delivered. The warranty starts then.`
        : order.deliveryMethod === "bus"
          ? `When the station says it has arrived, mark it ready and message ${name}.`
          : `When it's ready at the store, mark it ready and message ${name}.`;
    default:
      return "";
  }
}

/** Dispatch waits until a pending delivery fee has been agreed. */
export function blockedByFee(order: Pick<FlowOrder, "deliveryFeePending" | "status" | "deliveryMethod">): boolean {
  const next = nextStatus(order);
  return order.deliveryFeePending && (next === "in_transit" || (next === "arrived" && order.deliveryMethod !== "pickup"));
}

const TRACK = "Track it anytime: sherohq.com/track";

function paymentLine(order: FlowOrder): string {
  if (order.paymentStatus === "paid") return "";
  if (order.paymentMethod === "cash_on_delivery") return ` Please have ${formatCedis(order.totalPesewas)} ready in cash.`;
  if (order.paymentMethod === "pay_at_pickup") return ` Pay ${formatCedis(order.totalPesewas)} when you collect it.`;
  return "";
}

/** The WhatsApp message for the order's current status. */
export function whatsappMessage(order: FlowOrder): string {
  const hi = `Hi ${firstName(order.customerName)}, your SHERO order ${order.number}`;
  const station = order.pickupStation ?? order.town ?? "your station";
  switch (order.status) {
    case "placed":
      return `${hi} is in. We're checking it now and will confirm shortly.${
        order.deliveryFeePending ? ` We'll agree the delivery fee to ${order.region ?? "your region"} with you here before it leaves.` : ""
      } ${TRACK}`;
    case "confirmed":
      return order.deliveryMethod === "pickup"
        ? `${hi} is confirmed and packed. We'll message you as soon as it's ready to collect at our store in Tamale. ${TRACK}`
        : order.deliveryMethod === "bus"
          ? `${hi} is confirmed and packed, and goes on the bus to ${station} next. We'll message you when it's on its way. ${TRACK}`
          : `${hi} is confirmed and packed. We'll message you when it's on its way to you. ${TRACK}`;
    case "in_transit":
      return order.deliveryMethod === "bus"
        ? `${hi} is on the bus to ${station}. We'll message you when it's ready for pickup. ${TRACK}`
        : `${hi} is on its way to you now.${paymentLine(order)} ${TRACK}`;
    case "arrived": {
      const warranty = order.warrantyEndsOn ? ` Your one-week warranty runs to ${formatGhanaDate(order.warrantyEndsOn)}.` : "";
      if (order.deliveryMethod === "tamale") return `${hi} has been delivered. Thank you for buying from SHERO.${warranty}`;
      if (order.deliveryMethod === "bus")
        return `${hi} is ready for pickup at ${station}. Bring your order number.${paymentLine(order)}${warranty}`;
      return `${hi} is ready to collect at our store in Tamale.${paymentLine(order)}${warranty}`;
    }
    case "cancelled":
      return `${hi} has been cancelled. If that's unexpected, reply here and we'll sort it out.`;
  }
}

/** Click-to-chat to the customer's own number (E.164 without the +). */
export function customerChatLink(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(text)}`;
}

/** "020 *** 4521": enough to recognise a referrer, not to copy the number. */
export function maskPhone(phone: string): string {
  const national = phone.startsWith("+233") ? `0${phone.slice(4)}` : phone;
  return `${national.slice(0, 3)} *** ${national.slice(-4)}`;
}
