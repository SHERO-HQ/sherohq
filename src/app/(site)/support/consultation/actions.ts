"use server";

import { db } from "@/db";
import { consultations } from "@/db/schema";
import { parseConsultation, type FieldErrors } from "@/lib/forms/consultation";
import { business } from "@/lib/site";

export type ConsultationResult = { ok: true } | { ok: false; errors?: FieldErrors; message?: string };

export async function requestConsultation(form: FormData): Promise<ConsultationResult> {
  const parsed = parseConsultation(form);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const { contact, ...request } = parsed.data;
  try {
    await db.insert(consultations).values({ ...request, contactMethod: contact });
    return { ok: true };
  } catch (error) {
    console.error("Saving consultation request failed", error);
    return {
      ok: false,
      message: `We couldn't save your request just now. Please call or WhatsApp us on ${business.phoneDisplay}.`,
    };
  }
}
