"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { referrals } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { parseCedis } from "@/lib/admin/listing-form";

type Result = { ok: true } | { ok: false; message: string };

const done = () => {
  revalidatePath("/admin", "layout");
  return { ok: true } as const;
};

/** Records what was given; the site never promises a specific reward. */
export async function markThanked(id: string, form: FormData): Promise<Result> {
  await requireAdmin();
  const tokenType = String(form.get("tokenType") ?? "").trim().slice(0, 60) || null;
  const rawAmount = String(form.get("amount") ?? "").trim();
  const amount = rawAmount ? parseCedis(rawAmount) : null;
  if (rawAmount && amount === null) return { ok: false, message: "Enter the amount in cedis, e.g. 50, or leave it empty." };
  if (!tokenType && amount === null) return { ok: false, message: "Say what you gave, e.g. MoMo or airtime." };
  await db
    .update(referrals)
    .set({ status: "thanked", tokenType, tokenAmountPesewas: amount, thankedAt: new Date() })
    .where(and(eq(referrals.id, id), eq(referrals.status, "ready_to_thank")));
  return done();
}

export async function markAsked(id: string): Promise<Result> {
  await requireAdmin();
  await db
    .update(referrals)
    .set({ status: "asked_to_stay", askedAt: new Date() })
    .where(and(eq(referrals.id, id), inArray(referrals.status, ["ready_to_thank", "thanked"])));
  return done();
}

/** They agreed to stay in touch: the number is kept. */
export async function keepReferrer(id: string): Promise<Result> {
  await requireAdmin();
  await db
    .update(referrals)
    .set({ status: "kept", resolvedAt: new Date() })
    .where(and(eq(referrals.id, id), inArray(referrals.status, ["ready_to_thank", "thanked", "asked_to_stay"])));
  return done();
}

/** They declined or didn't answer: the number is erased; the order keeps a count. */
export async function deleteReferrer(id: string): Promise<Result> {
  await requireAdmin();
  await db
    .update(referrals)
    .set({ status: "deleted", referrerPhone: null, resolvedAt: new Date() })
    .where(eq(referrals.id, id));
  return done();
}
