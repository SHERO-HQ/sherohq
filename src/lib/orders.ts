import { randomInt } from "node:crypto";
import type { deliveryMethod, orderStatus } from "@/db/schema";

export type OrderStatus = (typeof orderStatus.enumValues)[number];
export type DeliveryMethod = (typeof deliveryMethod.enumValues)[number];

// No 0/O or 1/I, so numbers read back correctly over the phone.
const ORDER_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** A new customer-facing order number, e.g. "SH-7K2QX". */
export function newOrderNumber(): string {
  let code = "";
  for (let i = 0; i < 5; i++) code += ORDER_ALPHABET[randomInt(ORDER_ALPHABET.length)];
  return `SH-${code}`;
}

/** Accepts "sh-7k2qx", "7K2QX" or "SH 7K2QX" and returns "SH-7K2QX", or null. */
export function normaliseOrderNumber(input: string): string | null {
  const code = input.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^SH/, "");
  return /^[A-Z0-9]{5}$/.test(code) ? `SH-${code}` : null;
}

/** Status wording shared by Track Order and the admin, per delivery method. */
export function statusLabel(status: OrderStatus, method: DeliveryMethod): string {
  switch (status) {
    case "placed":
      return "Placed";
    case "confirmed":
      return "Confirmed and packed";
    case "in_transit":
      return method === "bus" ? "Sent to the station" : method === "tamale" ? "Out for delivery" : "Ready soon";
    case "arrived":
      return method === "tamale" ? "Delivered" : method === "bus" ? "Ready for pickup at the station" : "Ready for pickup";
    case "cancelled":
      return "Cancelled";
  }
}

/** The steps a customer sees for their delivery method, in order. */
export function statusSteps(method: DeliveryMethod): OrderStatus[] {
  // Store pickup skips transit: packed orders are ready at the shop.
  return method === "pickup" ? ["placed", "confirmed", "arrived"] : ["placed", "confirmed", "in_transit", "arrived"];
}

/** Warranty runs one week from arrival (admin scope). Returns YYYY-MM-DD. */
export function warrantyEndsOn(arrivedAt: Date): string {
  const end = new Date(arrivedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  return end.toISOString().slice(0, 10);
}

/** Delivery is free at or over the threshold in Settings; otherwise the quoted fee. */
export function deliveryFeePesewas(subtotalPesewas: number, thresholdPesewas: number, feePesewas: number): number {
  return subtotalPesewas >= thresholdPesewas ? 0 : feePesewas;
}

/** "GHS 4,200" or "GHS 4,200.50". */
export function formatCedis(pesewas: number): string {
  const cedis = pesewas / 100;
  const fractional = pesewas % 100 !== 0;
  return `GHS ${cedis.toLocaleString("en-GH", {
    minimumFractionDigits: fractional ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
