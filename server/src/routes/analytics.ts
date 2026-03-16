import express from "express";
import { query } from "../db/database";
import { adminAuth } from "../middleware/adminAuth";

const router = express.Router();

// POST /api/analytics/chat - Log a chat interaction
router.post("/chat", async (req, res) => {
  try {
    const { guestId, userId, query: userQuery, response, intent, recommendedProducts, hasImage } = req.body;

    await query(
      `INSERT INTO ai_chat_logs ("guestId", "userId", query, response, intent, "recommendedProducts", "hasImage")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [guestId, userId, userQuery, response, intent, JSON.stringify(recommendedProducts), hasImage || false]
    );

    // If intent is "recommend_failed" or similar, log it as a gap
    if (intent === "recommend_failed" || (userQuery.length > 3 && response.includes("shortlist"))) {
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
