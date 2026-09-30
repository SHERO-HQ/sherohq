import { describe, expect, it } from "vitest";
import { notificationEmail } from "./notify-messages";

const base = "https://admin.sherohq.com/admin";

describe("notificationEmail", () => {
  it("links a new order to its admin page and flags a fee still to agree", () => {
    const email = notificationEmail(
      {
        kind: "orders",
        id: "abc",
        number: "SH-7K2QX",
        customerName: "Ama",
        items: ["Dell Latitude 7490"],
        totalPesewas: 420_000,
        feePending: true,
        delivery: "bus",
        region: "Ashanti",
        town: "Kumasi",
        payment: "Cash on delivery",
      },
      base,
    );
    expect(email.subject).toBe("New order SH-7K2QX: GHS 4,200 + delivery");
    expect(email.text).toContain("Bus to Kumasi, Ashanti (delivery fee to agree on WhatsApp before dispatch)");
    expect(email.text).toContain(`${base}/orders/abc`);
  });

  it("says store pickup plainly", () => {
    const email = notificationEmail(
      {
        kind: "orders",
        id: "abc",
        number: "SH-7K2QX",
        customerName: "Ama",
        items: ["Laptop bag"],
        totalPesewas: 15_000,
        feePending: false,
        delivery: "pickup",
        region: null,
        town: null,
        payment: "Pay at the store",
      },
      base,
    );
    expect(email.subject).toBe("New order SH-7K2QX: GHS 150");
    expect(email.text).toContain("Store pickup\n");
  });

  it("puts what a consultation needs in the subject, and how to reach them", () => {
    const email = notificationEmail(
      {
        kind: "consultations",
        name: "Kofi",
        phone: "+233241234567",
        email: null,
        business: "Tastea",
        need: "software",
        contactMethod: "whatsapp",
        message: "An ordering app.",
      },
      base,
    );
    expect(email.subject).toBe("Consultation request: Custom software");
    expect(email.text).toContain("Prefers: WhatsApp");
    expect(email.text).not.toContain("Email:");
  });

  it("counts the waitlist", () => {
    const email = notificationEmail(
      {
        kind: "waitlists",
        product: "Merchander",
        name: "Esi",
        phone: "+233241234567",
        business: "Esi's Closet",
        detailLabel: "What you sell",
        detail: "Clothes",
        total: 1,
      },
      base,
    );
    expect(email.subject).toBe("Merchander waitlist: Esi");
    expect(email.text).toContain("1 person is on the list now.");
  });
});
