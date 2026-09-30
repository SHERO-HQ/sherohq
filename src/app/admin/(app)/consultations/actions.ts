"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { isConsultationStatus } from "@/lib/admin/consultation-flow";

type Result = { ok: true } | { ok: false; message: string };

/** Moving past New counts as contact: the 12-month retention runs from the last one. */
export async function setConsultationStatus(id: string, status: string): Promise<Result> {
  await requireAdmin();
  if (!isConsultationStatus(status)) return { ok: false, message: "Unknown step." };
  await db
    .update(consultations)
    .set({ status, ...(status === "new" ? {} : { lastContactAt: new Date() }) })
    .where(eq(consultations.id, id));
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function saveConsultationNotes(id: string, notes: string): Promise<Result> {
  await requireAdmin();
  await db
    .update(consultations)
    .set({ notes: notes.trim().slice(0, 5000) || null })
    .where(eq(consultations.id, id));
  revalidatePath("/admin/consultations");
  return { ok: true };
}

/** When they ask for their details to be removed. */
export async function deleteConsultation(id: string): Promise<Result> {
  await requireAdmin();
  await db.delete(consultations).where(eq(consultations.id, id));
  revalidatePath("/admin", "layout");
  return { ok: true };
}
