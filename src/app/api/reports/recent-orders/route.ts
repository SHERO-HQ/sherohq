import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/drizzle/schema";
import { desc } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { safeParse } from "@/lib/orderUtils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await db.select({
      id: orders.id,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
      shippingInfo: orders.shippingInfo
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);

    const formattedOrders = result.map((order) => {
      const shippingInfo = safeParse(order.shippingInfo) as any;
      
      return {
        id: order.id,
        total: parseFloat(order.total || "0"),
        status: order.status,
        createdAt: order.createdAt,
        customer: {
          firstName: shippingInfo?.firstName || "Unknown",
          lastName: shippingInfo?.lastName || "",
          email: shippingInfo?.email || "N/A"
        }
      };
    });

    return apiResponse.success(formattedOrders);
  } catch (error) {
    console.error("Recent Orders API Error:", error);
    return apiResponse.error("Failed to fetch recent orders");
  }
}
