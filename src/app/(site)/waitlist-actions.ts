"use server";

import { parseWaitlist, type WaitlistErrors, type WaitlistProduct } from "@/lib/forms/waitlist";
import { business } from "@/lib/site";

export type WaitlistResult = { ok: true } | { ok: false; errors?: WaitlistErrors; message?: string };

export async function joinWaitlist(product: WaitlistProduct, form: FormData): Promise<WaitlistResult> {
  const parsed = parseWaitlist(product, form);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  // TODO(db phase): save parsed.data to the product's waitlist (status New) for the admin.
  return {
    ok: false,
    message: `The waitlist isn't connected yet. Message us on WhatsApp at ${business.phoneDisplay} and we'll add you.`,
  };
}
