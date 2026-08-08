import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaignTemplates } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sync = url.searchParams.get("sync") === "true";
    
    if (sync) {
      await syncMetaTemplates();
    }

    const templates = await db.select().from(campaignTemplates).orderBy(campaignTemplates.createdAt);
    
    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, channel, content, whatsappTemplateLanguage, expectedParams, category } = body;

    if (!name || !channel) {
      return NextResponse.json({ error: "Name and channel are required" }, { status: 400 });
    }

    const inserted = await db.insert(campaignTemplates).values({
      name,
      description,
      channel,
      content,
      whatsappTemplateLanguage,
      expectedParams: expectedParams || [],
      category,
      isSync: false,
    }).returning();

    return NextResponse.json({ template: inserted[0] });
  } catch (error: any) {
    console.error("Failed to create template:", error);
    if (error.code === '23505') {
      return NextResponse.json({ error: "Template with this name and language already exists for this channel" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function syncMetaTemplates() {
  const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!WHATSAPP_BUSINESS_ACCOUNT_ID || !WHATSAPP_ACCESS_TOKEN) {
    console.warn("WhatsApp credentials not configured. Skipping Meta template sync.");
    return;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch templates from Meta:", errorText);
      return;
    }

    const data = await response.json();
    const templates = data.data || [];

    for (const t of templates) {
      // Find body component to extract text and parameters
      const bodyComponent = t.components?.find((c: any) => c.type === "BODY");
      const content = bodyComponent?.text || "";
      
      // Extract {{1}}, {{2}} to figure out expected params count
      const paramMatches = content.match(/\{\{(\d+)\}\}/g) || [];
      const paramIndices = paramMatches.map((p: string) => parseInt(p.replace(/[{}]/g, "")));
      const maxParam = paramIndices.length > 0 ? Math.max(...paramIndices) : 0;
      
      const expectedParams = Array.from({ length: maxParam }).map((_, i) => `Param ${i + 1}`);

      // Upsert into our DB
      const existing = await db.select().from(campaignTemplates)
        .where(
          and(
            eq(campaignTemplates.name, t.name),
            eq(campaignTemplates.channel, 'whatsapp'),
            eq(campaignTemplates.whatsappTemplateLanguage, t.language)
          )
        );

      if (existing.length > 0) {
        await db.update(campaignTemplates)
          .set({
            content,
            category: t.category,
            expectedParams,
            isSync: true,
            updatedAt: new Date().toISOString()
          })
          .where(eq(campaignTemplates.id, existing[0].id));
      } else {
        await db.insert(campaignTemplates).values({
          name: t.name,
          channel: 'whatsapp',
          whatsappTemplateLanguage: t.language,
          content,
          category: t.category,
          expectedParams,
          isSync: true,
        });
      }
    }
  } catch (error) {
    console.error("Meta sync error:", error);
  }
}
