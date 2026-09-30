"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { waitlistSignups } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { isWaitlistStatus } from "@/lib/admin/waitlist-steps";

type Result = { ok: true } | { ok: false; message: string };

export async function setSignupStatus(id: string, status: string): Promise<Result> {
  await requireAdmin();
  if (!isWaitlistStatus(status)) return { ok: false, message: "Unknown step." };
  await db.update(waitlistSignups).set({ status }).where(eq(waitlistSignups.id, id));
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** When someone asks to leave the list. */
export async function removeSignup(id: string): Promise<Result> {
  await requireAdmin();
  await db.delete(waitlistSignups).where(eq(waitlistSignups.id, id));
  revalidatePath("/admin", "layout");
  return { ok: true };
}
