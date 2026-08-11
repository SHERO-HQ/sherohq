import { NextRequest} from "next/server";
import { db } from "@/lib/db";
import { reviews, products } from "@/lib/drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const productId = (await params).id;
    const result = await db.select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
    return apiResponse.success(result);
  } catch (error) {
    console.error("Fetch product reviews error:", error);
    return apiResponse.error("Failed to fetch reviews");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const productId = (await params).id;
    const { userName, rating, comment } = await request.json();

    if (!userName || !rating) return apiResponse.error("Username and rating required", 400);

    const reviewId = uuidv4();
    await db.insert(reviews).values({
      id: reviewId,
      productId: productId,
      userName: userName,
      rating: rating,
      comment: comment || "",
      createdAt: new Date().toISOString(),
    });

    // Update product rating and reviews count
    const statsRes = await db.select({
      avgRating: sql`AVG(rating)`,
      count: sql`COUNT(*)`
    })
    .from(reviews)
    .where(eq(reviews.productId, productId));
    
    const stats = statsRes[0];

    await db.update(products).set({
      rating: (Math.round((Number(stats.avgRating) || 0) * 10) / 10).toString(),
      reviews: Number(stats.count)
    }).where(eq(products.id, productId));

    return apiResponse.success({ id: reviewId, success: true }, 201);
  } catch (error) {
    console.error("Create review error:", error);
    return apiResponse.error("Failed to submit review");
  }
}
