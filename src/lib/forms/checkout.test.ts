import { describe, expect, it } from "vitest";
import { parseCheckout, paymentOptions } from "./checkout";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
};

const allOnline = { momo: true, card: true };
const offline = { momo: false, card: false };

const bus = {
  name: "Ama Mensah",
  phone: "0244123456",
  delivery: "bus",
  region: "Ashanti",
  town: "Kumasi",
  place: "VIP station, Kumasi",
  payment: "momo",
};

describe("paymentOptions", () => {
  it("offers pay at the store only for pickup, and cash on delivery otherwise", () => {
    expect(paymentOptions("pickup", allOnline).map((o) => o.value)).toEqual(["momo", "card", "pay_at_pickup"]);
    expect(paymentOptions("bus", allOnline).map((o) => o.value)).toEqual(["momo", "card", "cash_on_delivery"]);
  });

  it("hides online payments until their provider is connected", () => {
    expect(paymentOptions("tamale", offline).map((o) => o.value)).toEqual(["cash_on_delivery"]);
    expect(paymentOptions("tamale", { momo: true, card: false }).map((o) => o.value)).toEqual([
      "momo",
      "cash_on_delivery",
    ]);
  });
});

describe("parseCheckout", () => {
  it("accepts a bus order and normalises the phone", () => {
    const result = parseCheckout(form(bus), allOnline);
    expect(result).toEqual({
      ok: true,
      data: {
        name: "Ama Mensah",
        phone: "+233244123456",
        email: null,
        referrerPhone: null,
        delivery: "bus",
        region: "Ashanti",
        town: "Kumasi",
        place: "VIP station, Kumasi",
        payment: "momo",
      },
    });
  });

  it("needs region, town and station for the bus", () => {
    const result = parseCheckout(form({ ...bus, region: "Lagos", town: "", place: "" }), allOnline);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["place", "region", "town"]);
  });

  it("needs an address in Tamale and nothing for pickup", () => {
    const tamale = parseCheckout(form({ ...bus, delivery: "tamale", place: "" }), allOnline);
    expect(tamale.ok).toBe(false);
    const pickup = parseCheckout(
      form({ name: "Ama", phone: "0244123456", delivery: "pickup", payment: "pay_at_pickup" }),
      offline,
    );
    expect(pickup).toMatchObject({ ok: true, data: { region: null, town: null, place: null } });
  });

  it("refuses a payment method that isn't offered", () => {
    expect(parseCheckout(form(bus), offline)).toMatchObject({ ok: false, errors: { payment: expect.any(String) } });
    expect(parseCheckout(form({ ...bus, payment: "pay_at_pickup" }), allOnline).ok).toBe(false);
  });

  it("checks the referral number and ignores it when empty", () => {
    expect(parseCheckout(form({ ...bus, referrerPhone: "0201234567" }), allOnline)).toMatchObject({
      ok: true,
      data: { referrerPhone: "+233201234567" },
    });
    expect(parseCheckout(form({ ...bus, referrerPhone: "12" }), allOnline).ok).toBe(false);
    expect(parseCheckout(form({ ...bus, referrerPhone: "+233244123456" }), allOnline).ok).toBe(false);
  });
});
