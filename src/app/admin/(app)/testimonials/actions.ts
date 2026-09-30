"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { parseTestimonialForm, type TestimonialErrors } from "@/lib/admin/testimonial-form";

export type SaveTestimonialState = { errors: TestimonialErrors; message: string | null };

export async function saveTestimonial(id: string | null, _state: SaveTestimonialState, form: FormData): Promise<SaveTestimonialState> {
  await requireAdmin();
  const parsed = parseTestimonialForm(form);
  if (!parsed.ok) return { errors: parsed.errors, message: "Check the highlighted fields." };
  const { orderNumber, ...values } = parsed.values;

  let orderId: string | null = null;
  if (orderNumber) {
    const [order] = await db.select({ id: orders.id }).from(orders).where(eq(orders.number, orderNumber)).limit(1);
    if (!order) return { errors: { orderNumber: "No order with that number." }, message: "Check the highlighted fields." };
    orderId = order.id;
  }

  const row = { ...values, orderId };
  let savedId = id;
  if (id) await db.update(testimonials).set(row).where(eq(testimonials.id, id));
  else [{ id: savedId }] = await db.insert(testimonials).values(row).returning({ id: testimonials.id });

  // Home and case studies show published ones.
  revalidatePath("/", "layout");
  redirect(`/admin/testimonials/${savedId}?saved=1`);
}

/** When they withdraw consent: gone from the site and from here. */
export async function deleteTestimonial(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();
  await db.delete(testimonials).where(eq(testimonials.id, id));
  revalidatePath("/", "layout");
  return { ok: true };
}
