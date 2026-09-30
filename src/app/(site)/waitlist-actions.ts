"use server";

import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { waitlistSignups } from "@/db/schema";
import { parseWaitlist, type WaitlistErrors } from "@/lib/forms/waitlist";
import { notifyOwner } from "@/lib/notify";
import { phoneFromParts } from "@/lib/phone-intl";
import { getPublishedProduct } from "@/lib/products";
import { business } from "@/lib/site";

export type WaitlistResult = { ok: true } | { ok: false; errors?: WaitlistErrors; message?: string };

export async function joinWaitlist(slug: string, form: FormData): Promise<WaitlistResult> {
  const unavailable = {
    ok: false as const,
    message: `We couldn't add you just now. Message us on WhatsApp at ${business.phoneDisplay} and we'll add you.`,
  };
  try {
    // Only a published product still in development has a waitlist.
    const product = await getPublishedProduct(slug);
    if (!product || product.status !== "in_development") return unavailable;
    const parsed = parseWaitlist(product, form, phoneFromParts);
    if (!parsed.ok) return { ok: false, errors: parsed.errors };
    // Signing up twice with the same number just keeps the first signup.
    const added = await db
      .insert(waitlistSignups)
      .values({ productId: product.id, ...parsed.data })
      .onConflictDoNothing()
      .returning({ id: waitlistSignups.id });
    if (added.length > 0) {
      const [{ total }] = await db
        .select({ total: count() })
        .from(waitlistSignups)
        .where(eq(waitlistSignups.productId, product.id));
      notifyOwner({
        kind: "waitlists",
        product: product.name,
        name: parsed.data.name,
        phone: parsed.data.phone,
        business: parsed.data.business,
        detailLabel: product.detailLabel,
        detail: parsed.data.detail,
        total,
      });
    }
    return { ok: true };
  } catch (error) {
    console.error("Saving waitlist signup failed", error);
    return unavailable;
  }
}
