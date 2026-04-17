import express from "express";
import { rateLimit } from "express-rate-limit";
import { query } from "../db/database";
import { adminAuth, requireRole } from "../middleware/adminAuth";

const router = express.Router();

// Rate limiting for chat analytics to prevent spam
const chatAnalyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});

// Common stop words to filter out of catalog gap keywords
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "else", "when",
  "at", "from", "by", "for", "with", "about", "against", "between",
  "into", "through", "during", "before", "after", "above", "below",
  "to", "up", "down", "in", "out", "on", "off", "over", "under",
  "again", "further", "once", "here", "there", "where", "why", "how",
  "all", "any", "both", "each", "few", "more", "most", "other", "some",
  "such", "no", "nor", "not", "only", "own", "same", "so", "than",
  "too", "very", "s", "t", "can", "will", "just", "don", "should", "now",
  "do", "you", "have", "i", "want", "need", "looking", "for", "buy", "get"
]);

/**
 * Determines whether a chat interaction should be logged as a catalog gap.
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

/**
 * Extracts meaningful keywords from a query by removing stop words.
 */
function extractGapKeywords(query: string): string {
  const words = query.toLowerCase().split(/[^\w]+/).filter(w => w.length > 1);
  const meaningful = words.filter(w => !STOP_WORDS.has(w));
  
  // Return up to 3 meaningful words as the gap keyword
  return meaningful.slice(0, 3).join(" ").trim();
}

// POST /api/analytics/chat - Log a chat interaction
router.post("/chat", chatAnalyticsLimiter, async (req, res) => {
  try {
    const {
      guestId,
      userId,
      query: userQuery,
      response,
      intent,
      recommendedProducts,
      hasImage,
      source = "general",
    } = req.body;

    if (!userQuery || typeof userQuery !== "string") {
      return res.status(400).json({ error: "query is required" });
    }

    await query(
      `INSERT INTO ai_chat_logs ("guestId", "userId", query, response, intent, "recommendedProducts", "hasImage", "source")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        guestId,
        userId,
        userQuery,
        response,
        intent,
        JSON.stringify(recommendedProducts),
        hasImage || false,
        source,
      ],
    );

    // Log catalog gap when the AI couldn't satisfy the request
    if (shouldLogCatalogGap(intent, userQuery, response)) {
      const keyword = extractGapKeywords(userQuery);
      if (keyword) {
        await query(
          `INSERT INTO catalog_gaps (keyword) VALUES ($1)
           ON CONFLICT (keyword) DO UPDATE SET "queryCount" = catalog_gaps."queryCount" + 1, "lastRequested" = CURRENT_TIMESTAMP`,
          [keyword],
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to log chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/analytics/summary - Admin only analytics
router.get("/summary", adminAuth, requireRole("manager"), async (req, res) => {
  try {
    const topIntents = await query(
      `
      SELECT COALESCE(intent, 'unknown') as intent, COUNT(*)::int as count
      FROM ai_chat_logs
      WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY intent
      ORDER BY count DESC
      LIMIT 6
      `,
    );

    const topGaps = await query(
      `SELECT keyword, "queryCount", "lastRequested" FROM catalog_gaps WHERE "isResolved" = false ORDER BY "queryCount" DESC LIMIT 10`,
    );

    const volume = await query(
      `
      SELECT DATE("createdAt") as day, COUNT(*)::int as count
      FROM ai_chat_logs
      WHERE "createdAt" >= CURRENT_DATE - INTERVAL '29 days'
      GROUP BY day
      ORDER BY day ASC
      `,
    );

    const totalsResult = await query(
      `
      SELECT
        COUNT(*)::int AS "totalInteractions",
        COUNT(*) FILTER (WHERE "hasImage" = true)::int AS "imageInteractions",
        COUNT(*) FILTER (WHERE intent = 'recommend_failed')::int AS "failedRecommendations"
      FROM ai_chat_logs
      WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days'
      `,
    );

    const gapVolumeResult = await query(
      `
      SELECT COALESCE(SUM("queryCount"), 0)::int AS "openGapRequests"
      FROM catalog_gaps
      WHERE "isResolved" = false
      `,
    );

    const totals = {
      totalInteractions: totalsResult.rows[0]?.totalInteractions || 0,
      imageInteractions: totalsResult.rows[0]?.imageInteractions || 0,
      failedRecommendations: totalsResult.rows[0]?.failedRecommendations || 0,
      openGapRequests: gapVolumeResult.rows[0]?.openGapRequests || 0,
    };

    res.json({
      success: true,
      data: {
        topIntents: topIntents.rows,
        topGaps: topGaps.rows,
        dailyVolume: volume.rows,
        totals,
      },
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
