import { db } from "./db";
import { campaignTemplates } from "./drizzle/schema";
import { eq, and } from "drizzle-orm";
import {
  BUILTIN_WHATSAPP_TEMPLATES,
  formatTemplateContent,
} from "./whatsapp-templates";

/**
 * Resolves a template name and parameter values to full human-readable text
 * Server-only helper with database template lookup.
 */
export async function resolveWhatsAppTemplateBody(
  templateName: string,
  params: string[] = []
): Promise<string> {
  // 1. Look up in database campaign templates
  try {
    const dbTemplate = await db.query.campaignTemplates.findFirst({
      where: and(
        eq(campaignTemplates.name, templateName),
        eq(campaignTemplates.channel, "whatsapp")
      ),
    });

    if (dbTemplate?.content) {
      return formatTemplateContent(dbTemplate.content, params);
    }
  } catch {
    // Database lookup failed, fall back to built-ins
  }

  // 2. Look up in built-in templates
  const builtin = BUILTIN_WHATSAPP_TEMPLATES.find((t) => t.name === templateName);
  if (builtin?.content) {
    return formatTemplateContent(builtin.content, params);
  }

  // 3. Fallback description if template is custom / unrecorded
  if (params && params.length > 0) {
    return `[Template: ${templateName}] Variables: ${params.join(", ")}`;
  }
  return `[Template: ${templateName}]`;
}
