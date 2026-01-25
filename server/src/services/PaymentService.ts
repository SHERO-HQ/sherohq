import * as dotenv from "dotenv";

dotenv.config();

const HUBTEL_BASE_URL =
  "https://payproxyapi.hubtel.com/merchantaccount/onlinecheckout/items/initiate";

interface PaymentRequest {
  totalAmount: number;
  description: string;
  callbackUrl: string;
  returnUrl: string; // The URL to redirect the user to after payment
  cancellationUrl: string;
  clientReference: string; // Unique order ID
}

interface PaymentResponse {
  status: string;
  data: {
    checkoutUrl: string;
    checkoutId: string;
    checkoutDirectUrl: string;
  };
}

class PaymentService {
  private merchantAccountNumber: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.merchantAccountNumber =
      process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER || "";
    this.clientId = process.env.HUBTEL_CLIENT_ID || "";
    this.clientSecret = process.env.HUBTEL_CLIENT_SECRET || "";

    if (!this.merchantAccountNumber || !this.clientId || !this.clientSecret) {
      console.warn(
        "⚠️ Hubtel credentials missing. Payment service will not work correctly.",
      );
    }
  }

  private getAuthHeader(): string {
    const authString = `${this.clientId}:${this.clientSecret}`;
    return `Basic ${Buffer.from(authString).toString("base64")}`;
  }

  public async initiatePayment(request: PaymentRequest): Promise<string> {
    if (!this.merchantAccountNumber) {
      throw new Error("Hubtel Merchant Account Number is missing");
    }

    const payload = {
      totalAmount: request.totalAmount,
      description: request.description,
      callbackUrl: request.callbackUrl,
      returnUrl: request.returnUrl,
      cancellationUrl: request.cancellationUrl,
      merchantAccountNumber: this.merchantAccountNumber,
      clientReference: request.clientReference,
    };

    try {
      const response = await fetch(HUBTEL_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Hubtel Payment Error:", errorText);
        throw new Error(`Hubtel API error: ${response.statusText}`);
      }

      const data = (await response.json()) as PaymentResponse;

      // Hubtel returns a checkout URL in the response
      if (
        data.status === "Success" &&
        data.data &&
        data.data.checkoutDirectUrl
      ) {
        return data.data.checkoutDirectUrl;
      }

      throw new Error("Failed to generate checkout URL from Hubtel");
    } catch (error) {
      console.error("Payment initiation failed:", error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
