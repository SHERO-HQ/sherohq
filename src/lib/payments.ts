/**
 * Which online payments checkout can take. Off until each provider is wired in
 * (Hubtel for MoMo, Paystack for cards), so checkout never offers a payment it
 * can't collect. TODO(owner): Hubtel and Paystack business accounts and keys.
 */
export function onlinePayments() {
  return { momo: false, card: false };
}

/**
 * How buyers can pay, in one sentence, listing only what checkout takes today.
 * Every page that mentions payment uses this, so switching a provider on
 * updates the copy everywhere.
 */
export function paymentSummary(online = onlinePayments()) {
  const methods = [
    online.momo && "MoMo (MTN MoMo or Telecel Cash)",
    online.card && "card (Visa or Mastercard)",
    "cash on delivery",
    "pay when you collect from our store",
  ].filter(Boolean) as string[];
  const sentence = `${methods.slice(0, -1).join(", ")} or ${methods.at(-1)}.`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
