/**
 * The provider's payment outcome. This is intentionally separate from an
 * order's fulfillment status: a declined payment leaves the order `pending`
 * so the customer can safely try payment again.
 */
export type PaymentStatus = "confirmed" | "failed" | "pending";

export type PaymentVerificationState = {
  paymentStatus: PaymentStatus;
  status: "processing" | "pending" | "failed";
  verified: boolean;
};

export type AdminOrderPaymentStatus = {
  label: string;
  tone: "success" | "warning" | "danger" | "muted";
};

export function getPaymentVerificationState(payload: {
  success?: boolean;
  paymentStatus?: string;
  status?: string;
  verified?: boolean;
  data?: { paymentStatus?: string; status?: string };
}): PaymentVerificationState {
  const rawPaymentStatus = payload.data?.paymentStatus ?? payload.paymentStatus;
  const normalizedPaymentStatus = (rawPaymentStatus || "").toLowerCase();

  if (normalizedPaymentStatus === "confirmed") {
    return { paymentStatus: "confirmed", status: "processing", verified: true };
  }

  if (normalizedPaymentStatus === "failed") {
    return { paymentStatus: "failed", status: "failed", verified: false };
  }

  if (normalizedPaymentStatus === "pending") {
    return { paymentStatus: "pending", status: "pending", verified: false };
  }

  const rawStatus = payload.data?.status ?? payload.status;
  const normalized = (rawStatus || "").toLowerCase();

  if (
    normalized === "processing" ||
    normalized === "success" ||
    normalized === "intransit" ||
    normalized === "delivered"
  ) {
    return { paymentStatus: "confirmed", status: "processing", verified: true };
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return { paymentStatus: "failed", status: "failed", verified: false };
  }

  if (payload.verified === true) {
    return { paymentStatus: "confirmed", status: "processing", verified: true };
  }

  return { paymentStatus: "pending", status: "pending", verified: false };
}

export function getAdminOrderPaymentStatus(payload: {
  paymentStatus?: string;
  status?: string;
  paymentMessage?: string | null;
}): AdminOrderPaymentStatus {
  const normalizedPaymentStatus = (payload.paymentStatus || "").toLowerCase();
  const normalized = (payload.status || "").toLowerCase();
  const message = (payload.paymentMessage || "").toLowerCase();

  if (normalizedPaymentStatus === "confirmed") {
    return { label: "Confirmed", tone: "success" };
  }

  if (normalizedPaymentStatus === "failed") {
    return { label: "Failed", tone: "danger" };
  }

  if (normalizedPaymentStatus === "pending") {
    return { label: "Pending", tone: "warning" };
  }

  if (
    normalized === "processing" ||
    normalized === "intransit" ||
    normalized === "delivered" ||
    normalized === "success" ||
    normalized === "paid" ||
    normalized === "succeeded"
  ) {
    return { label: "Confirmed", tone: "success" };
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return { label: "Failed", tone: "danger" };
  }

  if (message.includes("confirmed") || message.includes("successful")) {
    return { label: "Confirmed", tone: "success" };
  }

  if (message.includes("failed") || message.includes("mismatch")) {
    return { label: "Failed", tone: "danger" };
  }

  return { label: "Pending", tone: "warning" };
}
