import type { PaymentMethod } from "@/db/schema";
import { regions } from "@/lib/ghana";
import type { DeliveryMethod } from "@/lib/orders";
import { normaliseGhanaPhone } from "@/lib/phone";

export const deliveryOptions: Array<{ value: DeliveryMethod; label: string; detail: string }> = [
  { value: "tamale", label: "Within Tamale", detail: "Delivered to you the same day during opening hours." },
  {
    value: "bus",
    label: "Elsewhere in Ghana",
    detail: "Sent by bus. Orders before 5:00 PM leave the same day; usually 12–72 hours from dispatch.",
  },
  {
    value: "pickup",
    label: "Pick up at our store in Tamale",
    detail: "Free. We'll message you on WhatsApp when it's ready to collect.",
  },
];

const paymentDetails: Record<PaymentMethod, { label: string; detail: string }> = {
  momo: { label: "Mobile Money (MoMo)", detail: "MTN MoMo or Telecel Cash. You'll get a prompt on your phone to approve." },
  card: { label: "Card", detail: "Visa or Mastercard." },
  cash_on_delivery: { label: "Cash on delivery", detail: "Pay when your order arrives." },
  pay_at_pickup: { label: "Pay at the store", detail: "Pay when you collect your order." },
};

/**
 * Online payments show only once their provider is connected (Hubtel for MoMo,
 * Paystack for cards), so checkout never offers a payment it can't take.
 */
export type OnlinePayments = { momo: boolean; card: boolean };

export function paymentOptions(method: DeliveryMethod, online: OnlinePayments) {
  const methods: PaymentMethod[] = [];
  if (online.momo) methods.push("momo");
  if (online.card) methods.push("card");
  methods.push(method === "pickup" ? "pay_at_pickup" : "cash_on_delivery");
  return methods.map((value) => ({ value, ...paymentDetails[value] }));
}

export function paymentLabel(method: PaymentMethod): string {
  return paymentDetails[method].label;
}

export type CheckoutInput = {
  name: string;
  phone: string;
  email: string | null;
  referrerPhone: string | null;
  delivery: DeliveryMethod;
  region: string | null;
  town: string | null;
  /** Bus: the station to collect from. Tamale: the delivery address or landmark. */
  place: string | null;
  payment: PaymentMethod;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutInput, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

/** Validates checkout on both client and server; the server's word is final. */
export function parseCheckout(
  form: FormData,
  online: OnlinePayments,
): { ok: true; data: CheckoutInput } | { ok: false; errors: CheckoutErrors } {
  const errors: CheckoutErrors = {};

  const name = text(form.get("name"));
  if (!name) errors.name = "Tell us your name.";
  else if (name.length > 100) errors.name = "Keep your name under 100 characters.";

  const phone = normaliseGhanaPhone(text(form.get("phone")));
  if (!phone) errors.phone = "Enter a Ghana mobile number, like 0244123456.";

  const email = text(form.get("email"));
  if (email && !EMAIL.test(email)) errors.email = "Check the email address, or leave it empty.";

  const referralInput = text(form.get("referrerPhone"));
  const referrerPhone = referralInput ? normaliseGhanaPhone(referralInput) : null;
  if (referralInput && !referrerPhone) errors.referrerPhone = "Enter their Ghana mobile number, or leave it empty.";
  else if (referrerPhone && referrerPhone === phone) errors.referrerPhone = "This is your own number; leave it empty.";

  const delivery = text(form.get("delivery")) as DeliveryMethod;
  const validDelivery = deliveryOptions.some((o) => o.value === delivery);
  if (!validDelivery) errors.delivery = "Choose how you'd like to get your order.";

  const region = text(form.get("region"));
  const town = text(form.get("town"));
  const place = text(form.get("place"));
  if (delivery === "bus") {
    if (!(regions as readonly string[]).includes(region)) errors.region = "Choose your region.";
    if (!town) errors.town = "Tell us your town or city.";
    if (!place) errors.place = "Tell us which station you'll collect from.";
  } else if (delivery === "tamale" && !place) {
    errors.place = "Tell us where to deliver, with a landmark.";
  }
  if (place.length > 200) errors.place = "Keep it under 200 characters.";

  const payment = text(form.get("payment")) as PaymentMethod;
  if (validDelivery && !paymentOptions(delivery, online).some((o) => o.value === payment)) {
    errors.payment = "Choose how you'd like to pay.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      name,
      phone: phone!,
      email: email || null,
      referrerPhone,
      delivery,
      region: delivery === "bus" ? region : delivery === "tamale" ? "Northern" : null,
      town: delivery === "bus" ? town.slice(0, 80) : delivery === "tamale" ? "Tamale" : null,
      place: delivery === "pickup" ? null : place,
      payment,
    },
  };
}
