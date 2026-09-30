import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";

export async function adminProjects() {
  return db.select().from(projects).orderBy(asc(projects.displayOrder), asc(projects.name));
}

export async function adminProject(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return project ?? null;
}
