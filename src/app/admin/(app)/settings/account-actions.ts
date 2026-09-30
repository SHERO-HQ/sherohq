"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, admins } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/admin/password";
import { newRecoveryCodes } from "@/lib/admin/recovery";
import { matchTotp, newTotpSecret } from "@/lib/admin/totp";

export type AccountResult = { ok: true; message?: string; codes?: string[] } | { ok: false; message: string };

async function load() {
  const session = await requireAdmin();
  const [admin] = await db.select().from(admins).where(eq(admins.id, session.id)).limit(1);
  return { session, admin };
}

/** Sensitive changes need the current password, not just an open session. */
async function passwordOk(hash: string, form: FormData) {
  return verifyPassword(String(form.get("currentPassword") ?? ""), hash);
}

const signOutOthers = (adminId: string, keep: string) =>
  db.delete(adminSessions).where(and(eq(adminSessions.adminId, adminId), ne(adminSessions.id, keep)));

export async function changePassword(form: FormData): Promise<AccountResult> {
  const { session, admin } = await load();
  if (!(await passwordOk(admin.passwordHash, form))) return { ok: false, message: "Your current password isn't right." };
  const next = String(form.get("newPassword") ?? "");
  const problem = passwordProblem(next);
  if (problem) return { ok: false, message: problem };
  if (next !== String(form.get("repeatPassword") ?? "")) return { ok: false, message: "The new passwords don't match." };
  await db.update(admins).set({ passwordHash: await hashPassword(next), passwordChangedAt: new Date() }).where(eq(admins.id, admin.id));
  await signOutOthers(admin.id, session.sessionId);
  revalidatePath("/admin/settings");
  return { ok: true, message: "Password changed. Other devices are signed out." };
}

/** Starts setting up two-factor on a new phone: a new key, used only once a code from it is confirmed. */
export async function startTwoFactor(form: FormData): Promise<AccountResult> {
  const { admin } = await load();
  if (!(await passwordOk(admin.passwordHash, form))) return { ok: false, message: "Your current password isn't right." };
  await db.update(admins).set({ pendingTotpSecret: newTotpSecret() }).where(eq(admins.id, admin.id));
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function confirmTwoFactor(form: FormData): Promise<AccountResult> {
  const { session, admin } = await load();
  if (!admin.pendingTotpSecret) return { ok: false, message: "Start the setup again." };
  const step = matchTotp(admin.pendingTotpSecret, String(form.get("code") ?? ""), Date.now(), null);
  if (step === null) return { ok: false, message: "That code doesn't match. Check the phone's time is right, and try the newest code." };
  await db
    .update(admins)
    .set({ totpSecret: admin.pendingTotpSecret, pendingTotpSecret: null, totpLastStep: step, totpEnabledAt: new Date() })
    .where(eq(admins.id, admin.id));
  await signOutOthers(admin.id, session.sessionId);
  revalidatePath("/admin/settings");
  return { ok: true, message: "Two-factor login now uses the new phone. Other devices are signed out." };
}

export async function cancelTwoFactor(): Promise<AccountResult> {
  const { admin } = await load();
  await db.update(admins).set({ pendingTotpSecret: null }).where(eq(admins.id, admin.id));
  revalidatePath("/admin/settings");
  return { ok: true };
}

/** Eight new one-time recovery codes; the old ones stop working. Shown once. */
export async function renewRecoveryCodes(form: FormData): Promise<AccountResult> {
  const { admin } = await load();
  if (!(await passwordOk(admin.passwordHash, form))) return { ok: false, message: "Your current password isn't right." };
  const { codes, hashes } = newRecoveryCodes();
  await db.update(admins).set({ recoveryCodes: hashes }).where(eq(admins.id, admin.id));
  revalidatePath("/admin/settings");
  return { ok: true, codes };
}

export async function signOutEverywhereElse(): Promise<AccountResult> {
  const { session, admin } = await load();
  await signOutOthers(admin.id, session.sessionId);
  revalidatePath("/admin/settings");
  return { ok: true, message: "Every other device is signed out." };
}
