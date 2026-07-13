import { createHash } from "node:crypto";

export const ORDER_PAYMENT_METHODS = new Set([
  "card",
  "momo",
  "cash",
  "cod",
  "cash_on_delivery",
  "paystack",
  "store_pickup",
  "invoice_payment",
]);

export const PAYMENT_METHOD_ALIASES: Record<string, string> = {
  mobile_money: "momo",
};

export const roundCurrency = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const normalizePaymentMethod = (value: string): string =>
  PAYMENT_METHOD_ALIASES[value] || value;

export const hashOrderAccessToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const safeParse = (val: unknown): unknown => {
  if (!val) return null;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    console.error("Failed to parse JSON field:", e);
    return val;
  }
};

export const ORDER_STATUSES = new Set([
  "pending",
  "processing",
  "intransit",
  "delivered",
  "cancelled",
  "quote",
]);
