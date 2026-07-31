import { NextRequest} from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await query(
      `SELECT id, total, status, "createdAt", "shippingInfo"
       FROM orders 
       ORDER BY "createdAt" DESC 
       LIMIT $1`,
      [limit]
    );

    const orders = result.rows.map((order) => {
      let shippingInfo = order.shippingInfo;
      if (typeof shippingInfo === "string") {
        try { shippingInfo = JSON.parse(shippingInfo); } catch { shippingInfo = {}; }
      }
      
      return {
        id: order.id,
        total: parseFloat(order.total),
        status: order.status,
        createdAt: order.createdAt,
        customer: {
          firstName: shippingInfo?.firstName || "Unknown",
          lastName: shippingInfo?.lastName || "",
          email: shippingInfo?.email || "N/A"}};
    });

    return apiResponse.success(orders);
  } catch (error) {
    console.error("Recent Orders API Error:", error);
    return apiResponse.error("Failed to fetch recent orders");
  }
}
