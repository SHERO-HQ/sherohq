import "server-only";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { adminSessions, admins, loginEvents } from "@/db/schema";

/** The signed-in admin's account, for Settings. */
export async function accountDetails(adminId: string) {
  const [admin] = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);
  const [sessions, history] = await Promise.all([
    db.select({ id: adminSessions.id }).from(adminSessions).where(and(eq(adminSessions.adminId, adminId), gt(adminSessions.expiresAt, new Date()))),
    // Every attempt, including failed ones against this account and lockouts.
    db.select().from(loginEvents).orderBy(desc(loginEvents.createdAt)).limit(15),
  ]);
  return { admin, sessionCount: sessions.length, history };
}

/** The authenticator app's setup code as an SVG QR code (black on white, as scanners expect). */
export async function setupQr(uri: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toString(uri, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
}
