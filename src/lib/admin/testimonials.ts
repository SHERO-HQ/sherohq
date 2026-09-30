import "server-only";
import { asc, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { orders, projects, testimonials } from "@/db/schema";

export async function adminTestimonials() {
  return db
    .select({ testimonial: testimonials, projectName: projects.name, orderNumber: orders.number })
    .from(testimonials)
    .leftJoin(projects, eq(projects.id, testimonials.projectId))
    .leftJoin(orders, eq(orders.id, testimonials.orderId))
    .orderBy(desc(testimonials.createdAt));
}

export async function adminTestimonial(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db
    .select({ testimonial: testimonials, orderNumber: orders.number, orderPhone: orders.phone })
    .from(testimonials)
    .leftJoin(orders, eq(orders.id, testimonials.orderId))
    .where(eq(testimonials.id, id))
    .limit(1);
  return row ?? null;
}

export async function projectChoices() {
  return db.select({ id: projects.id, name: projects.name, client: projects.client }).from(projects).orderBy(asc(projects.name));
}

export async function testimonialsNeedingConsent() {
  const [{ n }] = await db.select({ n: count() }).from(testimonials).where(isNull(testimonials.consentGivenAt));
  return n;
}
