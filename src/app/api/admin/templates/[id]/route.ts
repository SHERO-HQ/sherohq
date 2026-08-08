import { NextRequest, NextResponse } from "next/server";
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
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ template: updated[0] });
  } catch (error: any) {
    console.error("Failed to update template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const deleted = await db.delete(campaignTemplates).where(eq(campaignTemplates.id, id)).returning();
    
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
