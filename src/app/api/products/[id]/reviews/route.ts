import { NextRequest} from "next/server";
import { db } from "@/lib/db";
import { reviews, products } from "@/lib/drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiResponse, validateBody } from "@/lib/api-utils";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

const ReviewSchema = z.object({
  userName: z.string().trim().min(1).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

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

    // Reviews are anonymous, so cap submissions per IP to limit rating stuffing.
    const limiter = await rateLimit(`review_${getClientIp(request)}`, 5, 60 * 60_000);
    if (!limiter.success) {
      return apiResponse.error("Too many reviews submitted. Please try again later.", 429);
    }

    const { data, error } = await validateBody(request, ReviewSchema);
    if (error) return error;
    const { userName, rating, comment } = data!;

    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { id: true },
    });
    if (!product) return apiResponse.notFound("Product not found");

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
