import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.id !== userId) {
      return NextResponse.json({ error: "Unauthorized to access these orders" }, { status: 403 });
    }

    const result = await query(
      `
      SELECT * FROM orders
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC
    `,
      [userId]
    );

    const orders = result.rows.map((order) => ({
      ...order,
      items: safeParse(order.items),
      shippingInfo: safeParse(order.shippingInfo),
      total: Number(order.total),
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
