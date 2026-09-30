import "server-only";
import { cache } from "react";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";

/** Testimonials show nowhere on the site until this many real, consented ones are published. */
export const MIN_TESTIMONIALS = 3;

export type PublicTestimonial = { id: string; quote: string; attribution: string; business: string | null; projectId: string | null };

/**
 * Published testimonials for the site, newest first, or none at all while
 * fewer than three are published. Consent is checked here as well as by the
 * database, so a withdrawn consent can't slip through.
 */
export const getPublicTestimonials = cache(async (): Promise<PublicTestimonial[]> => {
  try {
    const rows = await db
      .select({
        id: testimonials.id,
        quote: testimonials.quote,
        attribution: testimonials.attribution,
        business: testimonials.business,
        projectId: testimonials.projectId,
      })
      .from(testimonials)
      .where(and(eq(testimonials.published, true), isNotNull(testimonials.consentGivenAt)))
      .orderBy(desc(testimonials.createdAt));
    return rows.length >= MIN_TESTIMONIALS ? rows : [];
  } catch (error) {
    console.error("Loading testimonials failed", error);
    return [];
  }
});
