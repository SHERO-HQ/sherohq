import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { campaignTemplates } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, content, whatsappTemplateLanguage, expectedParams, category } = body;

    const updated = await db.update(campaignTemplates).set({
      name,
      description,
      content,
      whatsappTemplateLanguage,
      expectedParams: expectedParams || [],
      category,
      updatedAt: new Date().toISOString(),
    }).where(eq(campaignTemplates.id, id)).returning();

    if (updated.length === 0) {
      return apiResponse.notFound("Template not found");
    }

    return apiResponse.success({ template: updated[0] });
  } catch (error: any) {
    console.error("Failed to update template:", error);
    return apiResponse.error(error.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const deleted = await db.delete(campaignTemplates).where(eq(campaignTemplates.id, id)).returning();
    
    if (deleted.length === 0) {
      return apiResponse.notFound("Template not found");
    }

    return apiResponse.success({ success: true });
  } catch (error: any) {
    console.error("Failed to delete template:", error);
    return apiResponse.error(error.message, 500);
  }
}
