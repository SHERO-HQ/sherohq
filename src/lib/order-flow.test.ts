import { describe, expect, it } from "vitest";
import { advanceLabel, blockedByFee, customerChatLink, maskPhone, nextStatus, whatsappMessage, type FlowOrder } from "./order-flow";

const bus: FlowOrder = {
  number: "SH-7K2QX",
  customerName: "Kwame Asante",
  deliveryMethod: "bus",
  status: "confirmed",
  region: "Ashanti",
  town: "Kumasi",
  pickupStation: "VIP station, Kumasi",
  paymentMethod: "cash_on_delivery",
  paymentStatus: "pending",
  totalPesewas: 465_000,
  deliveryFeePending: false,
  warrantyEndsOn: null,
};

describe("order flow", () => {
  it("steps through each delivery method in order", () => {
    expect(nextStatus({ status: "placed", deliveryMethod: "bus" })).toBe("confirmed");
    expect(nextStatus({ status: "confirmed", deliveryMethod: "bus" })).toBe("in_transit");
    expect(nextStatus({ status: "confirmed", deliveryMethod: "pickup" })).toBe("arrived");
    expect(nextStatus({ status: "arrived", deliveryMethod: "tamale" })).toBeNull();
    expect(nextStatus({ status: "cancelled", deliveryMethod: "bus" })).toBeNull();
  });

  it("names the next action for the delivery method", () => {
    expect(advanceLabel("in_transit", "bus")).toBe("Mark as sent to the station");
    expect(advanceLabel("in_transit", "tamale")).toBe("Mark as out for delivery");
    expect(advanceLabel("arrived", "tamale")).toBe("Mark as delivered");
    expect(advanceLabel("arrived", "pickup")).toBe("Mark as ready for pickup");
  });

  it("holds dispatch until a pending delivery fee is agreed", () => {
    expect(blockedByFee({ ...bus, deliveryFeePending: true })).toBe(true);
    expect(blockedByFee({ ...bus, status: "placed", deliveryFeePending: true })).toBe(false);
    expect(blockedByFee({ ...bus, deliveryFeePending: false })).toBe(false);
  });

  it("writes the message for each step", () => {
    expect(whatsappMessage(bus)).toBe(
      "Hi Kwame, your SHERO order SH-7K2QX is confirmed and packed, and goes on the bus to VIP station, Kumasi next. We'll message you when it's on its way. Track it anytime: sherohq.com/track",
    );
    expect(whatsappMessage({ ...bus, status: "arrived", warrantyEndsOn: "2026-10-09" })).toBe(
      "Hi Kwame, your SHERO order SH-7K2QX is ready for pickup at VIP station, Kumasi. Bring your order number. Please have GHS 4,650 ready in cash. Your one-week warranty runs to 9 Oct 2026.",
    );
    expect(whatsappMessage({ ...bus, status: "placed", deliveryFeePending: true })).toContain(
      "We'll agree the delivery fee to Ashanti with you here before it leaves.",
    );
  });

  it("links to the customer's chat and masks referrer numbers", () => {
    expect(customerChatLink("+233244123456", "Hi")).toBe("https://wa.me/233244123456?text=Hi");
    expect(maskPhone("+233201234521")).toBe("020 *** 4521");
  });
});
