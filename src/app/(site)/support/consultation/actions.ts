"use server";

import { parseConsultation, type FieldErrors } from "@/lib/forms/consultation";
import { business } from "@/lib/site";

export type ConsultationResult = { ok: true } | { ok: false; errors?: FieldErrors; message?: string };

export async function requestConsultation(form: FormData): Promise<ConsultationResult> {
  const parsed = parseConsultation(form);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  // TODO(db phase): save parsed.data as a New consultation request for the admin.
  // Until then, say so plainly rather than pretend the request was received.
  return {
    ok: false,
    message: `Online booking isn't connected yet. Please call or WhatsApp us on ${business.phoneDisplay}.`,
  };
}
