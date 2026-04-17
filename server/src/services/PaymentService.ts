import * as dotenv from "dotenv";

dotenv.config();

const HUBTEL_BASE_URL =
  "https://payproxyapi.hubtel.com/merchantaccount/onlinecheckout/items/initiate";
const PAYSTACK_BASE_URL = "https://api.paystack.co/transaction/initialize";

interface PaymentRequest {
  totalAmount: number;
  description: string;
  callbackUrl: string;
  returnUrl: string;
  cancellationUrl: string;
  clientReference: string;
  email: string; // Required for Paystack
  provider?: "hubtel" | "paystack";
}

interface PaymentResponse {
  status: string;
  data: {
    checkoutUrl: string;
    checkoutId: string;
    checkoutDirectUrl: string;
  };
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

class PaymentService {
  private merchantAccountNumber: string;
  private clientId: string;
  private clientSecret: string;
  private paystackSecretKey: string;

  constructor() {
    this.merchantAccountNumber =
      process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER || "";
    this.clientId = process.env.HUBTEL_CLIENT_ID || "";
    this.clientSecret = process.env.HUBTEL_CLIENT_SECRET || "";
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "";

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
    if (request.provider === "paystack") {
      return this.initiatePaystackPayment(request);
    }
    return this.initiateHubtelPayment(request);
  }

  private async initiatePaystackPayment(
    request: PaymentRequest,
  ): Promise<string> {
    if (!this.paystackSecretKey) {
      throw new Error("Paystack Secret Key is missing");
    }

    const payload = {
      email: request.email,
      amount: Math.round(request.totalAmount * 100), // Paystack expects kobo/pesewas
      reference: request.clientReference,
      callback_url: request.returnUrl, // Paystack redirects here after payment
      metadata: {
        description: request.description,
        cancel_action: request.cancellationUrl,
      },
      channels: ["card", "mobile_money"],
    };

    try {
      const response = await fetch(PAYSTACK_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Paystack Payment Error:", errorText);
        throw new Error(`Paystack API error: ${response.statusText}`);
      }

      const data = (await response.json()) as PaystackResponse;

      if (data.status && data.data.authorization_url) {
        return data.data.authorization_url;
      }

      throw new Error("Failed to generate checkout URL from Paystack");
    } catch (error) {
      console.error("Paystack initiation failed:", error);
      throw error;
    }
  }

  private async initiateHubtelPayment(
    request: PaymentRequest,
  ): Promise<string> {
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

  /**
   * Utilities for Webhook processing
   */
  public parseWebhookAmount(provider: string, payload: any): number {
    if (provider === "paystack") {
      // Paystack amount is in kobo/pesewas (minor units)
      return (payload.data?.amount || 0) / 100;
    }
    if (provider === "hubtel") {
      // Hubtel amount is already in major units (GHS)
      return payload.Amount || 0;
    }
    return 0;
  }

  public getTransactionId(provider: string, payload: any): string {
    if (provider === "paystack") {
      return payload.data?.id || "N/A";
    }
    if (provider === "hubtel") {
      return payload.TransactionId || "N/A";
    }
    return "N/A";
  }
}

export const paymentService = new PaymentService();
