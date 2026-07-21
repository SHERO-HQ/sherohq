import { describe, expect, it } from "vitest";
import {
  getAdminOrderPaymentStatus,
  getPaymentVerificationState,
} from "./paymentStatus";

describe("getPaymentVerificationState", () => {
  it("returns processing when the API reports a successful payment", () => {
    expect(
      getPaymentVerificationState({ success: true, status: "processing" }),
    ).toEqual({
      paymentStatus: "confirmed",
      status: "processing",
      verified: true,
    });
  });

  it("returns failed for explicit failed or cancelled statuses", () => {
    expect(
      getPaymentVerificationState({ success: true, status: "failed" }),
    ).toEqual({
      paymentStatus: "failed",
      status: "failed",
      verified: false,
    });

    expect(
      getPaymentVerificationState({ success: true, status: "cancelled" }),
    ).toEqual({
      paymentStatus: "failed",
      status: "failed",
      verified: false,
    });
  });

  it("supports the wrapped apiResponse shape returned by the server", () => {
    expect(
      getPaymentVerificationState({
        success: true,
        status: "processing",
        verified: true,
      }),
    ).toEqual({
      paymentStatus: "confirmed",
      status: "processing",
      verified: true,
    });
  });

  it("treats confirmed shipment states as successful payment confirmation", () => {
    expect(
      getPaymentVerificationState({ success: true, status: "intransit" }),
    ).toEqual({
      paymentStatus: "confirmed",
      status: "processing",
      verified: true,
    });

    expect(
      getPaymentVerificationState({ success: true, status: "delivered" }),
    ).toEqual({
      paymentStatus: "confirmed",
      status: "processing",
      verified: true,
    });
  });

  it("maps a successful order payment to a readable admin label", () => {
    expect(getAdminOrderPaymentStatus({ status: "processing" })).toEqual({
      label: "Confirmed",
      tone: "success",
    });
  });

  it("treats paid or succeeded states as confirmed payment", () => {
    expect(getAdminOrderPaymentStatus({ status: "paid" })).toEqual({
      label: "Confirmed",
      tone: "success",
    });

    expect(getAdminOrderPaymentStatus({ status: "succeeded" })).toEqual({
      label: "Confirmed",
      tone: "success",
    });
  });

  it("prioritizes an explicit provider outcome over retryable order status", () => {
    expect(
      getPaymentVerificationState({
        paymentStatus: "failed",
        status: "pending",
      }),
    ).toEqual({
      paymentStatus: "failed",
      status: "failed",
      verified: false,
    });
  });

  it("uses the explicit payment outcome for the admin payment badge", () => {
    expect(
      getAdminOrderPaymentStatus({
        paymentStatus: "failed",
        status: "pending",
      }),
    ).toEqual({ label: "Failed", tone: "danger" });
  });
});
