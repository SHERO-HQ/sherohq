import { createHash, createHmac } from "node:crypto";

export const generateOrderSecurityToken = (
  orderId: string,
  createdAt: string | Date | null | undefined,
  total: number | string,
): string => {
  const secret =
    process.env.ORDER_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET ||
    "sherotech-order-sec-key";
  const dateStr =
    createdAt instanceof Date
      ? createdAt.toISOString()
      : typeof createdAt === "string"
        ? createdAt
        : "";
  const normalizedTotal = Number(total || 0).toFixed(2);
  return createHmac("sha256", secret)
    .update(`${orderId}:${dateStr}:${normalizedTotal}`)
    .digest("hex");
};

export const verifyOrderAccessToken = (
  providedToken: string | null | undefined,
  order: {
    id: string;
    createdAt?: string | Date | null;
    total?: number | string | null;
    orderAccessTokenHash?: string | null;
  },
): boolean => {
  if (!providedToken) return false;
  const cleanToken = providedToken.trim();

  // 1. Direct hash match with original random orderAccessToken
  if (
    order.orderAccessTokenHash &&
    hashOrderAccessToken(cleanToken) === order.orderAccessTokenHash
  ) {
    return true;
  }

  // 2. HMAC deterministic signature match
  if (order.id && order.createdAt !== undefined && order.total !== undefined && order.total !== null) {
    const expectedHmac = generateOrderSecurityToken(
      order.id,
      order.createdAt,
      order.total,
    );
    if (cleanToken === expectedHmac) {
      return true;
    }
  }

  return false;
};

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
