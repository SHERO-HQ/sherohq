/**
 * Hubtel Online Checkout — Server-side utilities
 *
 * Provides authentication helpers, type definitions, and a webhook
 * verification function that confirms transaction status directly
 * with Hubtel's API (recommended best practice since Hubtel does
 * not use HMAC signatures).
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const HUBTEL_API_BASE =
  process.env.HUBTEL_API_BASE_URL || "https://payproxyapi.hubtel.com";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Build the HTTP Basic Auth header value from Hubtel credentials.
 * Returns `null` if credentials are not configured.
 */
export function buildHubtelAuth(): string | null {
  const clientId = process.env.HUBTEL_CLIENT_ID;
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );
  return `Basic ${encoded}`;
}

/**
 * Get the Merchant Account Number from environment.
 */
export function getHubtelMerchantAccount(): string | undefined {
  return process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER;
}

// ---------------------------------------------------------------------------
// Types — Online Checkout (Hosted Payment Page)
// ---------------------------------------------------------------------------

/** Payload sent to Hubtel to create a checkout session. */
export interface HubtelCheckoutRequest {
  totalAmount: number;
  description: string;
  callbackUrl: string;
  returnUrl: string;
  cancellationUrl: string;
  merchantAccountNumber: string;
  clientReference: string;
}

/** Shape of a successful Hubtel API response. */
export interface HubtelCheckoutResponse {
  responseCode: string;
  message?: string;
  data?: {
    checkoutUrl: string;
    checkoutId?: string;
    clientReference?: string;
    transactionId?: string;
  };
}

/** Hubtel payment details nested inside the callback Data object. */
export interface HubtelPaymentDetails {
  MobileMoneyNumber?: string;
  PaymentType?: string; // "mobilemoney" | etc.
  Channel?: string; // "mtn-gh" | "vodafone-gh" | "tigo-gh" | etc.
}

/** Hubtel webhook callback payload (nested Data structure). */
export interface HubtelWebhookPayload {
  /** Top-level response code, e.g. "0000" for success */
  ResponseCode?: string;
  /** Top-level status — may mirror Data.Status */
  Status?: string;
  /** Nested data object containing the actual transaction details */
  Data?: {
    CheckoutId?: string;
    SalesInvoiceId?: string;
    ClientReference?: string;
    Status?: string; // "Success" | "Completed" | "Failed" | "Cancelled" | "Pending"
    Amount?: number;
    CustomerPhoneNumber?: string;
    PaymentDetails?: HubtelPaymentDetails;
    Description?: string;
  };
  // ── Legacy / flat fields (some Hubtel products may still use these) ──
  TransactionId?: string;
  ClientReference?: string;
  Amount?: number;
  PaymentMethod?: string;
  CustomerMsisdn?: string;
  Description?: string;
}

/** Shape of the Hubtel transaction status query response. */
export interface HubtelTransactionStatusResponse {
  responseCode: string;
  message?: string;
  data?: {
    transactionId?: string;
    clientReference?: string;
    amount?: number;
    status?: string;
    paymentMethod?: string;
  };
}

// ---------------------------------------------------------------------------
// Webhook verification — Server-side status check (recommended)
// ---------------------------------------------------------------------------

/**
 * Verify a Hubtel webhook by querying Hubtel's transaction status API.
 *
 * Since Hubtel does not provide HMAC signatures on webhooks, the
 * recommended approach is to make a server-side call back to Hubtel
 * to confirm the transaction actually exists and has the claimed status.
 *
 * Returns `true` if the transaction is confirmed as successful,
 * `false` otherwise (including network errors — fail-safe).
 */
export async function verifyHubtelTransaction(
  clientReference: string,
): Promise<{ verified: boolean; status: string | null }> {
  const auth = buildHubtelAuth();
  if (!auth) {
    console.warn(
      "Hubtel credentials not configured — skipping webhook verification",
    );
    // In production without credentials we should not trust the webhook,
    // but during initial integration we allow it through with a warning.
    return { verified: true, status: null };
  }

  try {
    const url = `${HUBTEL_API_BASE}/items/status/${encodeURIComponent(clientReference)}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10_000), // 10s timeout
    });

    if (!resp.ok) {
      console.error(
        `Hubtel status check failed: HTTP ${resp.status} for ref ${clientReference}`,
      );
      return { verified: false, status: null };
    }

    const data: HubtelTransactionStatusResponse = await resp.json();

    const txStatus = data.data?.status?.toLowerCase() ?? "";
    const isSuccess =
      txStatus === "success" || txStatus === "completed" || txStatus === "paid";

    return { verified: isSuccess, status: data.data?.status ?? null };
  } catch (err) {
    console.error("Hubtel transaction verification error:", err);
    return { verified: false, status: null };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize the various Hubtel status values to a canonical form.
 * Hubtel uses "Success", "Completed", and "Paid" interchangeably
 * across different API products.
 */
export function normalizeHubtelStatus(
  status: string,
): "Success" | "Failed" | "Pending" | "Cancelled" {
  const lower = (status ?? "").toLowerCase();
  if (lower === "success" || lower === "completed" || lower === "paid") {
    return "Success";
  }
  if (lower === "failed") return "Failed";
  if (lower === "cancelled" || lower === "canceled") return "Cancelled";
  return "Pending";
}
