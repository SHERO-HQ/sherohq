import "server-only";
import { cache } from "react";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { missing, type Content } from "@/lib/content";

export type ProjectRow = typeof projects.$inferSelect;

/** A project with its text as Content: empty fields become [bracketed] placeholders. */
export type Project = ReturnType<typeof withPlaceholders>;

/** What each empty field asks for, shown in brackets until the owner fills it in. */
function withPlaceholders(p: ProjectRow) {
  const or = (value: string | null, hint: string): Content => (value ? value : missing(hint));
  const client = p.client ?? "the client";
  return {
    ...p,
    client: or(p.client, "Client name"),
    summary: or(p.summary, `One line: the problem ${p.name} solves for its users`),
    built: or(p.built, "What we built, e.g. web app · mobile app · dashboard"),
    year: or(p.year, "Year"),
    outcome: or(p.outcome, `One-sentence outcome: what ${p.name} made possible for ${client}.`),
    problem: or(p.problem, `What ${client} was dealing with before. Two or three plain sentences, in their words where possible.`),
    solution: or(p.solution, "What SHERO built and why it was designed that way. Name the parts people actually use."),
    result: or(
      p.result,
      "What changed after launch: something concrete and true, such as how many people use it, time saved, or what they can now do.",
    ),
  };
}

/** Client work shown on the site, in the admin's order; empty without a database. */
export const getPublishedProjects = cache(async (): Promise<Project[]> => {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.published, true))
      .orderBy(asc(projects.displayOrder), asc(projects.name));
    return rows.map(withPlaceholders);
  } catch (error) {
    console.error("Loading projects failed", error);
    return [];
  }
});

export const getPublishedProject = cache(async (slug: string): Promise<Project | null> => {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.published, true)))
    .limit(1);
  return row ? withPlaceholders(row) : null;
});

/**
 * "We've worked with": each project's client and the project itself, once
 * each (e.g. Samakose, TrustCircle, Tastea, Dajrim).
 */
export async function getClientNames(): Promise<string[]> {
  const rows = await getPublishedProjects();
  const names = rows.flatMap((p) => [typeof p.client === "string" ? p.client : null, p.name]);
  return [...new Set(names.filter((n): n is string => Boolean(n)))];
}
