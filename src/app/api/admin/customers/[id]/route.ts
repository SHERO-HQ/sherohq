import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;

    // Fetch user details
    const userRes = await query(
      'SELECT id, name, email, phone, avatar, "emailVerified", "isActive", "createdAt", "shippingAddress" FROM users WHERE id = $1',
      [id]
    );

    if (userRes.rows.length === 0) {
      return apiResponse.error("Customer not found", 404);
    }

    const user = userRes.rows[0];

    // Fetch user stats (total orders, total spent)
    const statsRes = await query(
      `SELECT 
        COUNT(*) as "totalOrders", 
        COALESCE(SUM(total), 0) as "totalSpent",
        MAX("createdAt") as "lastOrderDate"
       FROM orders 
       WHERE "userId" = $1 AND status != 'cancelled'`,
      [id]
    );
    const stats = statsRes.rows[0];

    // Fetch recent orders
    const ordersRes = await query(
      'SELECT id, total, status, "createdAt" FROM orders WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
      [id]
    );

    return apiResponse.success({
      user,
      stats,
      orders: ordersRes.rows,
    });
  } catch (error) {
    console.error("Fetch customer details error:", error);
    return apiResponse.error("Failed to fetch customer details");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const { isActive } = await request.json();

    await query(
      'UPDATE users SET "isActive" = $1 WHERE id = $2',
      [isActive, id]
    );

    return apiResponse.success({ message: "Customer updated successfully" });
  } catch (error) {
    console.error("Update customer error:", error);
    return apiResponse.error("Failed to update customer");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || admin.role !== "superadmin") {
      return apiResponse.forbidden("Only superadmins can delete customers");
    }

    const { id } = await params;

    // We might want to use a transaction if we delete related data
    await query("DELETE FROM users WHERE id = $1", [id]);

    return apiResponse.success({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    return apiResponse.error("Failed to delete customer");
  }
}
