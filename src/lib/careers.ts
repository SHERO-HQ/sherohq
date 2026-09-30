import "server-only";
import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { roles } from "@/db/schema";

/** Open roles for the Careers page, oldest first; none without a database. */
export const getOpenRoles = cache(async () => {
  try {
    return await db
      .select({ id: roles.id, title: roles.title, description: roles.description, howToApply: roles.howToApply })
      .from(roles)
      .where(eq(roles.open, true))
      .orderBy(asc(roles.createdAt));
  } catch (error) {
    console.error("Loading roles failed", error);
    return [];
  }
});
