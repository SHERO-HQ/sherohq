"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { roles } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { parseRoleForm, type RoleErrors } from "@/lib/admin/role-form";
import { routes } from "@/lib/site";

export type SaveRoleState = { errors: RoleErrors; message: string | null };

export async function saveRole(id: string | null, _state: SaveRoleState, form: FormData): Promise<SaveRoleState> {
  await requireAdmin();
  const parsed = parseRoleForm(form);
  if (!parsed.ok) return { errors: parsed.errors, message: "Check the highlighted fields." };
  const values = parsed.values;
  let savedId = id;
  if (id) {
    const [before] = await db.select({ open: roles.open }).from(roles).where(eq(roles.id, id)).limit(1);
    await db
      .update(roles)
      .set({ ...values, ...(before?.open && !values.open ? { closedAt: new Date() } : {}) })
      .where(eq(roles.id, id));
  } else {
    [{ id: savedId }] = await db.insert(roles).values(values).returning({ id: roles.id });
  }
  revalidatePath(routes.careers);
  redirect(`/admin/careers/${savedId}?saved=1`);
}

export async function deleteRole(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();
  await db.delete(roles).where(eq(roles.id, id));
  revalidatePath(routes.careers);
  return { ok: true };
}
