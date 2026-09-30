"use server";

import { and, eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { listings, orderEvents, orderItems, orders, referrals } from "@/db/schema";
import { CART_COOKIE, parseCart, PLACED_COOKIE, serialiseCart } from "@/lib/cart";
import { parseCheckout, paymentLabel, type CheckoutErrors } from "@/lib/forms/checkout";
import { TAMALE_LOCAL } from "@/lib/ghana";
import { specSummary } from "@/lib/listings";
import { notifyOwner } from "@/lib/notify";
import { deliveryFeePesewas, newOrderNumber } from "@/lib/orders";
import { getDeliveryRates, getShopSettings, onlinePayments } from "@/lib/shop";
import { business, routes } from "@/lib/site";

export type PlaceOrderResult = { ok: false; errors?: CheckoutErrors; message?: string };

class Unavailable extends Error {
  constructor(public models: string[]) {
    super("Some items are no longer available");
  }
}

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "23505";

export async function placeOrder(form: FormData): Promise<PlaceOrderResult> {
  const parsed = parseCheckout(form, onlinePayments());
  if (!parsed.ok) return { ok: false, errors: parsed.errors };
  const input = parsed.data;

  const store = await cookies();
  const ids = parseCart(store.get(CART_COOKIE)?.value);
  if (ids.length === 0) return { ok: false, message: "Your cart is empty. Add a device from the shop first." };

  const [settings, rates] = await Promise.all([getShopSettings(), getDeliveryRates()]);
  const rateKey = input.delivery === "tamale" ? TAMALE_LOCAL : input.region;
  const rate = rateKey ? (rates[rateKey] ?? null) : null;

  let placed: { id: string; number: string; items: string[]; total: number; feePending: boolean } | null = null;
  try {
    for (let attempt = 0; attempt < 5 && !placed; attempt++) {
      try {
        placed = await db.transaction(async (tx) => {
          // Lock the devices so two buyers can't take the same one.
          const items = await tx
            .select({
              id: listings.id,
              model: listings.model,
              specs: listings.specs,
              pricePesewas: listings.pricePesewas,
              status: listings.status,
            })
            .from(listings)
            .where(inArray(listings.id, ids))
            .for("update");

          const unavailable = ids.filter((id) => items.find((item) => item.id === id)?.status !== "in_stock");
          if (unavailable.length > 0) {
            throw new Unavailable(items.filter((item) => unavailable.includes(item.id)).map((item) => item.model));
          }

          const subtotal = items.reduce((sum, item) => sum + item.pricePesewas, 0);
          const fee = deliveryFeePesewas({
            method: input.delivery,
            subtotalPesewas: subtotal,
            thresholdPesewas: settings.freeDeliveryThresholdPesewas,
            regionRatePesewas: rate,
          });

          const candidate = newOrderNumber();
          const [order] = await tx
            .insert(orders)
            .values({
              number: candidate,
              customerName: input.name,
              phone: input.phone,
              email: input.email,
              deliveryMethod: input.delivery,
              region: input.region,
              town: input.town,
              pickupStation: input.delivery === "bus" ? input.place : null,
              address: input.delivery === "tamale" ? input.place : null,
              paymentMethod: input.payment,
              subtotalPesewas: subtotal,
              deliveryFeePesewas: fee ?? 0,
              deliveryFeePending: fee === null,
              totalPesewas: subtotal + (fee ?? 0),
              hadReferral: input.referrerPhone !== null,
            })
            .returning({ id: orders.id });

          await tx.insert(orderItems).values(
            items.map((item) => ({
              orderId: order.id,
              listingId: item.id,
              model: item.model,
              specSummary: specSummary(item.specs) || null,
              pricePesewas: item.pricePesewas,
            })),
          );
          await tx.insert(orderEvents).values({ orderId: order.id, status: "placed" });
          if (input.referrerPhone) {
            await tx.insert(referrals).values({ orderId: order.id, referrerPhone: input.referrerPhone });
          }
          // Held for this order; the admin marks them sold, or releases them if it's cancelled.
          await tx
            .update(listings)
            .set({ status: "reserved" })
            .where(and(inArray(listings.id, ids), eq(listings.status, "in_stock")));
          return {
            id: order.id,
            number: candidate,
            items: items.map((item) => item.model),
            total: subtotal + (fee ?? 0),
            feePending: fee === null,
          };
        });
      } catch (error) {
        // An order number clash is vanishingly rare; try another number.
        if (!isUniqueViolation(error)) throw error;
      }
    }
  } catch (error) {
    if (error instanceof Unavailable) {
      const names = error.models.join(", ");
      return {
        ok: false,
        message: `${names || "An item"} was just reserved by another order. Remove it from your cart to continue.`,
      };
    }
    console.error("Placing order failed", error);
  }

  if (!placed) {
    return {
      ok: false,
      message: `We couldn't place your order just now. Please try again, or WhatsApp us on ${business.phoneDisplay}.`,
    };
  }

  store.set(CART_COOKIE, serialiseCart([]), { path: "/", maxAge: 0 });
  // Lets the confirmation page show this order to the person who placed it.
  store.set(PLACED_COOKIE, placed.number, {
    path: routes.checkout,
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  notifyOwner({
    kind: "orders",
    id: placed.id,
    number: placed.number,
    customerName: input.name,
    items: placed.items,
    totalPesewas: placed.total,
    feePending: placed.feePending,
    delivery: input.delivery,
    region: input.region,
    town: input.town,
    payment: paymentLabel(input.payment),
  });
  redirect(`${routes.checkout}/placed`);
}
