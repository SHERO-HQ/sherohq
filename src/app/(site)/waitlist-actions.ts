"use server";

import { db } from "@/db";
import { waitlistSignups } from "@/db/schema";
import { parseWaitlist, type WaitlistErrors, type WaitlistProduct } from "@/lib/forms/waitlist";
import { business } from "@/lib/site";

export type WaitlistResult = { ok: true } | { ok: false; errors?: WaitlistErrors; message?: string };

export async function joinWaitlist(product: WaitlistProduct, form: FormData): Promise<WaitlistResult> {
  const parsed = parseWaitlist(product, form);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  try {
    // Signing up twice with the same number just keeps the first signup.
    await db.insert(waitlistSignups).values(parsed.data).onConflictDoNothing();
    return { ok: true };
  } catch (error) {
    console.error("Saving waitlist signup failed", error);
    return {
      ok: false,
      message: `We couldn't add you just now. Message us on WhatsApp at ${business.phoneDisplay} and we'll add you.`,
    };
  }
}
