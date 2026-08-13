import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { campaignTemplates } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sync = url.searchParams.get("sync") === "true";
    let syncResult: { success: boolean; count?: number; error?: string } | null = null;
    
    if (sync) {
      syncResult = await syncMetaTemplates();
    }

    const templates = await db.select().from(campaignTemplates).orderBy(campaignTemplates.createdAt);
    
    return apiResponse.success({ templates, syncResult });
  } catch (error: any) {
    console.error("Failed to fetch templates:", error);
    return apiResponse.error(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, channel, content, whatsappTemplateLanguage, expectedParams, category } = body;

    if (!name || !channel) {
      return apiResponse.error("Name and channel are required", 400);
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

    return apiResponse.success({ template: inserted[0] });
  } catch (error: any) {
    console.error("Failed to create template:", error);
    if (error.code === '23505') {
      return apiResponse.error("Template with this name and language already exists for this channel", 409);
    }
    return apiResponse.error(error.message, 500);
  }
}

async function syncMetaTemplates(): Promise<{ success: boolean; count?: number; error?: string }> {
  let WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!WHATSAPP_ACCESS_TOKEN) {
    console.warn("WHATSAPP_ACCESS_TOKEN not configured. Skipping Meta template sync.");
    return { success: false, error: "WHATSAPP_ACCESS_TOKEN is not configured in environment variables." };
  }

  // If WHATSAPP_BUSINESS_ACCOUNT_ID is not directly configured, automatically resolve it from the phone number ID
  if (!WHATSAPP_BUSINESS_ACCOUNT_ID && WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const phoneRes = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}?fields=whatsapp_business_account`, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`
        }
      });
      if (phoneRes.ok) {
        const phoneData = await phoneRes.json();
        WHATSAPP_BUSINESS_ACCOUNT_ID = phoneData.whatsapp_business_account?.id;
        if (WHATSAPP_BUSINESS_ACCOUNT_ID) {
          console.log(`[WhatsApp Sync] Auto-resolved WABA ID: ${WHATSAPP_BUSINESS_ACCOUNT_ID}`);
        }
      }
    } catch (err) {
      console.error("Failed to auto-resolve WABA ID from phone number ID:", err);
    }
  }

  if (!WHATSAPP_BUSINESS_ACCOUNT_ID) {
    return {
      success: false,
      error: "WhatsApp Business Account ID (WABA ID) not found. Please set WHATSAPP_BUSINESS_ACCOUNT_ID in environment variables or verify WHATSAPP_PHONE_NUMBER_ID.",
    };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates?limit=100`, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errorMsg = errorJson?.error?.message || `HTTP ${response.status}`;
      console.error("Failed to fetch templates from Meta:", errorMsg);
      return { success: false, error: `Meta API Error: ${errorMsg}` };
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
            status: t.status || 'APPROVED',
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
          status: t.status || 'APPROVED',
          expectedParams,
          isSync: true,
        });
      }
    }

    return { success: true, count: templates.length };
  } catch (error: any) {
    console.error("Meta sync error:", error);
    return { success: false, error: error.message || String(error) };
  }
}
