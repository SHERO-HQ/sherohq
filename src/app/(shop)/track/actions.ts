"use server";

import { findOrder, type OrderView } from "@/lib/order-lookup";
import { normaliseOrderNumber } from "@/lib/orders";
import { normaliseGhanaPhone } from "@/lib/phone";
import { business } from "@/lib/site";

export type TrackResult =
  | { ok: true; order: OrderView }
  | { ok: false; errors?: { number?: string; phone?: string }; message?: string };

export async function trackOrder(form: FormData): Promise<TrackResult> {
  const number = normaliseOrderNumber(String(form.get("number") ?? ""));
  const phone = normaliseGhanaPhone(String(form.get("phone") ?? ""));
  if (!number || !phone) {
    return {
      ok: false,
      errors: {
        number: number ? undefined : "Enter the order number, like SH-7K2QX.",
        phone: phone ? undefined : "Enter the phone number you ordered with.",
      },
    };
  }
  try {
    const order = await findOrder(number, phone);
    if (order) return { ok: true, order };
    // Same answer whether the number or the phone is wrong, so neither can be guessed.
    return {
      ok: false,
      message: `We couldn't find order ${number} with that phone number. Check both, or WhatsApp us on ${business.phoneDisplay}.`,
    };
  } catch (error) {
    console.error("Order lookup failed", error);
    return { ok: false, message: `We couldn't look that up just now. Please try again, or call ${business.phoneDisplay}.` };
  }
}
