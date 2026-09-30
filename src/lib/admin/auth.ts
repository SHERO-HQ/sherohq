import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, count, eq, gt, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, admins, loginEvents } from "@/db/schema";
import { decoyHash, verifyPassword } from "./password";
import { redeemRecoveryCode } from "./recovery";
import { matchTotp } from "./totp";

// One admin account, signed in with email, password and a two-factor code
// (docs/admin-scope.md). Sessions live in the database; the browser holds
// only a random token, and the database only its hash.

const COOKIE = "__Host-shero-admin";
const SESSION_HOURS = 12;
const WINDOW_MINUTES = 15;
const MAX_FAILURES_PER_IP = 5;
const MAX_FAILURES_OVERALL = 20;

export const adminPaths = {
  login: "/admin/login",
  home: "/admin/listings",
} as const;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

async function client() {
  const list = await headers();
  // Vercel puts the visitor's address first in x-forwarded-for.
  const ip = list.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  return { ip, userAgent: list.get("user-agent")?.slice(0, 300) ?? null };
}

async function recentFailures(ip: string | null) {
  const since = sql`now() - make_interval(mins => ${WINDOW_MINUTES})`;
  const failed = and(eq(loginEvents.outcome, "failed"), gt(loginEvents.createdAt, since));
  const [[overall], [fromIp]] = await Promise.all([
    db.select({ n: count() }).from(loginEvents).where(failed),
    ip
      ? db.select({ n: count() }).from(loginEvents).where(and(failed, eq(loginEvents.ip, ip)))
      : Promise.resolve([{ n: 0 }]),
  ]);
  return { overall: overall.n, fromIp: fromIp.n };
}

export type SignInResult = { ok: true } | { ok: false; message: string };

export async function signIn(input: { email: string; password: string; code: string }): Promise<SignInResult> {
  const { ip, userAgent } = await client();
  const record = (outcome: "success" | "failed" | "locked", adminId: string | null = null) =>
    db.insert(loginEvents).values({ adminId, outcome, ip, userAgent });

  const failures = await recentFailures(ip);
  if (failures.fromIp >= MAX_FAILURES_PER_IP || failures.overall >= MAX_FAILURES_OVERALL) {
    await record("locked");
    return { ok: false, message: `Too many attempts. Try again in ${WINDOW_MINUTES} minutes.` };
  }

  const email = input.email.trim().toLowerCase();
  const [admin] = email ? await db.select().from(admins).where(eq(admins.email, email)).limit(1) : [];
  // Always check a password, so a wrong email takes as long as a wrong password.
  const passwordOk = await verifyPassword(input.password, admin?.passwordHash ?? (await decoyHash()));

  let secondFactor: { step: number } | { recoveryLeft: string[] } | null = null;
  if (admin && passwordOk && admin.totpSecret && admin.totpEnabledAt) {
    const step = matchTotp(admin.totpSecret, input.code, Date.now(), admin.totpLastStep);
    if (step !== null) secondFactor = { step };
    else {
      const left = redeemRecoveryCode(input.code, admin.recoveryCodes);
      if (left) secondFactor = { recoveryLeft: left };
    }
  }

  if (!admin || !passwordOk || !secondFactor) {
    await record("failed", admin?.id ?? null);
    return { ok: false, message: "Those details don't match. Check your email, password and code." };
  }

  await db
    .update(admins)
    .set("step" in secondFactor ? { totpLastStep: secondFactor.step } : { recoveryCodes: secondFactor.recoveryLeft })
    .where(eq(admins.id, admin.id));

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
  await db.insert(adminSessions).values({ adminId: admin.id, tokenHash: hashToken(token), expiresAt });
  await record("success", admin.id);

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return { ok: true };
}

/** The signed-in admin for this request, or null. */
export const getAdmin = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ id: admins.id, email: admins.email, sessionId: adminSessions.id })
    .from(adminSessions)
    .innerJoin(admins, eq(admins.id, adminSessions.adminId))
    .where(and(eq(adminSessions.tokenHash, hashToken(token)), gt(adminSessions.expiresAt, new Date())))
    .limit(1);
  return row ?? null;
});

/**
 * Every admin page and server action calls this first. Layouts alone aren't
 * enough: actions can be called directly, without rendering the page.
 */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect(adminPaths.login);
  return admin;
}

export async function signOut() {
  const admin = await getAdmin();
  if (admin) await db.delete(adminSessions).where(eq(adminSessions.id, admin.sessionId));
  // A __Host- cookie is only replaced when the same attributes come with it.
  (await cookies()).set(COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}
