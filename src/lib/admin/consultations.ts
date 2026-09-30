import "server-only";
import { count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { consultationTabs, type ConsultationTab } from "./consultation-flow";

export async function adminConsultations(tab: ConsultationTab) {
  const statuses = [...consultationTabs.find((t) => t.value === tab)!.statuses];
  return db
    .select()
    .from(consultations)
    .where(inArray(consultations.status, statuses))
    .orderBy(desc(consultations.createdAt))
    .limit(200);
}

export async function consultationCounts() {
  const rows = await db.select({ status: consultations.status, n: count() }).from(consultations).groupBy(consultations.status);
  return Object.fromEntries(
    consultationTabs.map((tab) => [
      tab.value,
      rows.filter((r) => (tab.statuses as readonly string[]).includes(r.status)).reduce((sum, r) => sum + r.n, 0),
    ]),
  ) as Record<ConsultationTab, number>;
}

export async function newConsultations() {
  const [{ n }] = await db.select({ n: count() }).from(consultations).where(eq(consultations.status, "new"));
  return n;
}

export async function adminConsultation(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db.select().from(consultations).where(eq(consultations.id, id)).limit(1);
  return row ?? null;
}
