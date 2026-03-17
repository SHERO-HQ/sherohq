import express from "express";
import { rateLimit } from "express-rate-limit";
import { query } from "../db/database";
import { adminAuth } from "../middleware/adminAuth";

const router = express.Router();

// Rate limiting for chat analytics to prevent spam
const chatAnalyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});

/**
 * Determines whether a chat interaction should be logged as a catalog gap.
 * A gap is logged when:
 *   - The AI explicitly reported it could not find matching products (`recommend_failed`), or
 *   - The user query is substantive (>3 chars) and the AI response mentioned a shortlist,
 *     indicating the query was routed to a fallback product list rather than a direct match.
 */
function shouldLogCatalogGap(
  intent: unknown,
  userQuery: string,
  response: unknown,
): boolean {
  if (intent === "recommend_failed") return true;
  if (
    userQuery.length > 3 &&
    typeof response === "string" &&
    response.includes("shortlist")
  ) {
    return true;
  }
  return false;
}

// POST /api/analytics/chat - Log a chat interaction
router.post("/chat", chatAnalyticsLimiter, async (req, res) => {
  try {
    const { guestId, userId, query: userQuery, response, intent, recommendedProducts, hasImage } = req.body;

    if (!userQuery || typeof userQuery !== "string") {
      return res.status(400).json({ error: "query is required" });
    }

    await query(
      `INSERT INTO ai_chat_logs ("guestId", "userId", query, response, intent, "recommendedProducts", "hasImage")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [guestId, userId, userQuery, response, intent, JSON.stringify(recommendedProducts), hasImage || false]
    );

    // Log catalog gap when the AI couldn't satisfy the request
    if (shouldLogCatalogGap(intent, userQuery, response)) {
      const keyword = userQuery.split(" ").slice(0, 3).join(" ").toLowerCase();
      await query(
        `INSERT INTO catalog_gaps (keyword) VALUES ($1)
         ON CONFLICT (keyword) DO UPDATE SET "queryCount" = catalog_gaps."queryCount" + 1, "lastRequested" = CURRENT_TIMESTAMP`,
        [keyword]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to log chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/analytics/summary - Admin only analytics
router.get("/summary", adminAuth, async (req, res) => {
  try {
    const topIntents = await query(
      `SELECT intent, COUNT(*) as count FROM ai_chat_logs GROUP BY intent ORDER BY count DESC LIMIT 5`
    );

    const topGaps = await query(
      `SELECT keyword, "queryCount", "lastRequested" FROM catalog_gaps WHERE "isResolved" = false ORDER BY "queryCount" DESC LIMIT 10`
    );

    const volume = await query(
      `SELECT DATE("createdAt") as day, COUNT(*) as count FROM ai_chat_logs GROUP BY day ORDER BY day DESC LIMIT 7`
    );

    res.json({
      success: true,
      data: {
        topIntents: topIntents.rows,
        topGaps: topGaps.rows,
        dailyVolume: volume.rows,
      }
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
