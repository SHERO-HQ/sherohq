import { apiResponse } from "@/lib/api-utils";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { getUserFromSession } from "@/lib/auth";
import { safeParse } from "@/lib/orderUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId;
    const currentUser = await getUserFromSession();

    if (!currentUser) {
      return apiResponse.unauthorized();
    }

    if (currentUser.id !== userId) {
      return apiResponse.error("Unauthorized to access these orders", 403);
    }

    const result = await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const formattedOrders = result.map((order) => ({
      ...order,
      items: safeParse(order.items),
      shippingInfo: safeParse(order.shippingInfo),
      total: Number(order.total),
    }));

    return apiResponse.success(formattedOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return apiResponse.error("Failed to fetch orders", 500);
  }
}
