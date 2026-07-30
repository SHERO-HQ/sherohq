import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession, getUserFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const [admin, user] = await Promise.all([
      getAdminFromSession(),
      getUserFromSession(),
    ]);

    const result = await query(
      `SELECT * FROM tickets WHERE id = $1 OR ticket_no::text = $1 LIMIT 1`,
      [ticketId]
    );

    if (result.rowCount === 0) {
      return apiResponse.notFound("Ticket not found");
    }

    const ticket = result.rows[0];

    // Access control: admin or the ticket owner
    if (!admin && (!user || (user.id !== ticket.userId && user.email !== ticket.email))) {
      return apiResponse.unauthorized();
    }

    return apiResponse.success(ticket);
  } catch (error) {
    console.error("Fetch ticket error:", error);
    return apiResponse.error("Failed to fetch ticket");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { ticketId } = await params;
    const result = await query(
      `DELETE FROM tickets WHERE id = $1 OR ticket_no::text = $1 RETURNING ticket_no`,
      [ticketId]
    );

    if (result.rowCount === 0) {
      return apiResponse.notFound("Ticket not found");
    }

    await logActivity(
      admin.id,
      "ticket_delete",
      "warning",
      `Deleted support ticket #${result.rows[0].ticket_no}`
    );

    return apiResponse.success({ message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Delete ticket error:", error);
    return apiResponse.error("Failed to delete ticket");
  }
}
