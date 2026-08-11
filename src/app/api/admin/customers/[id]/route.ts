import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;

    // Fetch user details
    const userRes = await db.execute(sql`
      SELECT id, name, email, phone, avatar, "emailVerified", "isActive", "createdAt", "shippingAddress" FROM users WHERE id = ${id}
    `);

    const userRows = (userRes.rows || userRes) as Record<string, unknown>[];
    if (userRows.length === 0) {
      return apiResponse.error("Customer not found", 404);
    }

    const user = userRows[0];

    // Fetch user stats (total orders, total spent)
    const statsRes = await db.execute(sql`
      SELECT 
        COUNT(*) as "totalOrders", 
        COALESCE(SUM(total), 0) as "totalSpent",
        MAX("createdAt") as "lastOrderDate"
       FROM orders 
       WHERE "userId" = ${id} AND status != 'cancelled'
    `);
    const statsRows = (statsRes.rows || statsRes) as Record<string, unknown>[];
    const stats = statsRows[0];

    // Fetch recent orders
    const ordersRes = await db.execute(sql`
      SELECT id, total, status, "createdAt" FROM orders WHERE "userId" = ${id} ORDER BY "createdAt" DESC LIMIT 10
    `);

    return apiResponse.success({
      user,
      stats,
      orders: (ordersRes.rows || ordersRes) as Record<string, unknown>[],
    });
  } catch (error) {
    console.error("Fetch customer details error:", error);
    return apiResponse.error("Failed to fetch customer details");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const { isActive } = await request.json();

    await db.execute(sql`UPDATE users SET "isActive" = ${isActive} WHERE id = ${id}`);

    return apiResponse.success({ message: "Customer updated successfully" });
  } catch (error) {
    console.error("Update customer error:", error);
    return apiResponse.error("Failed to update customer");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin || admin.role !== "superadmin") {
      return apiResponse.forbidden("Only superadmins can delete customers");
    }

    const { id } = await params;

    // We might want to use a transaction if we delete related data
    await db.execute(sql`DELETE FROM users WHERE id = ${id}`);

    return apiResponse.success({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete customer error:", error);
    return apiResponse.error("Failed to delete customer");
  }
}
