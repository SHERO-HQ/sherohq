import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { clientPartners } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const body = await request.json();
    const { name, tagline, logo, logoDark, website, category, order, active } = body;

    const existing = await db
      .select()
      .from(clientPartners)
      .where(eq(clientPartners.id, id))
      .limit(1);

    if (existing.length === 0) {
      return apiResponse.error("Client/Partner not found", 404);
    }

    await db
      .update(clientPartners)
      .set({
        ...(name !== undefined && { name }),
        ...(tagline !== undefined && { tagline }),
        ...(logo !== undefined && { logo }),
        ...(logoDark !== undefined && { logoDark }),
        ...(website !== undefined && { website }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order: Number(order) }),
        ...(active !== undefined && { active: Boolean(active) }),
      })
      .where(eq(clientPartners.id, id));

    logActivity(
      admin.id,
      "client_update",
      "success",
      `Admin ${admin.username} updated client/partner: ${name || id}`
    ).catch(console.error);

    return apiResponse.success({ id, message: "Client updated successfully" });
  } catch (error) {
    console.error("Error updating client:", error);
    return apiResponse.error("Failed to update client", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;

    const existing = await db
      .select()
      .from(clientPartners)
      .where(eq(clientPartners.id, id))
      .limit(1);

    if (existing.length === 0) {
      return apiResponse.error("Client/Partner not found", 404);
    }

    await db.delete(clientPartners).where(eq(clientPartners.id, id));

    logActivity(
      admin.id,
      "client_delete",
      "success",
      `Admin ${admin.username} deleted client/partner: ${existing[0].name}`
    ).catch(console.error);

    return apiResponse.success({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return apiResponse.error("Failed to delete client", 500);
  }
}
