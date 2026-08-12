import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reviews, products } from "@/lib/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/activity";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) {
      return apiResponse.unauthorized();
    }

    const { id } = await params;
    if (!id) {
      return apiResponse.error("Review ID is required", 400);
    }

    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);

    if (existingReview.length === 0) {
      return apiResponse.error("Review not found", 404);
    }

    const productId = existingReview[0].productId;

    await db.delete(reviews).where(eq(reviews.id, id));

    if (productId) {
      const statsRes = await db
        .select({
          avgRating: sql`AVG(rating)`,
          count: sql`COUNT(*)`,
        })
        .from(reviews)
        .where(eq(reviews.productId, productId));

      const stats = statsRes[0];
      const count = Number(stats?.count) || 0;
      const avg =
        count > 0
          ? Math.round((Number(stats?.avgRating) || 0) * 10) / 10
          : 0;

      await db
        .update(products)
        .set({
          rating: avg.toString(),
          reviews: count,
        })
        .where(eq(products.id, productId));
    }

    await logActivity(
      admin.id,
      "review_delete",
      "success",
      `Deleted review #${id}`
    );

    return apiResponse.success({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    return apiResponse.error("Failed to delete review");
  }
}
