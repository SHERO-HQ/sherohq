import { NextRequest} from "next/server";
import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { apiResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const productId = (await params).id;
    const result = await query(
      'SELECT * FROM reviews WHERE "productId" = $1 ORDER BY "createdAt" DESC',
      [productId]
    );
    return apiResponse.success(result.rows);
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
    await query(
      `INSERT INTO reviews (id, "productId", "userName", rating, comment, "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [reviewId, productId, userName, rating, comment || ""]
    );

    // Update product rating and reviews count
    const statsRes = await query(
      'SELECT AVG(rating) as "avgRating", COUNT(*) as count FROM reviews WHERE "productId" = $1',
      [productId]
    );
    const stats = statsRes.rows[0];

    await query(
      "UPDATE products SET rating = $1, reviews = $2 WHERE id = $3",
      [
        Math.round((Number(stats.avgRating) || 0) * 10) / 10,
        Number(stats.count),
        productId
      ]
    );

    return apiResponse.success({ id: reviewId, success: true }, 201);
  } catch (error) {
    console.error("Create review error:", error);
    return apiResponse.error("Failed to submit review");
  }
}
