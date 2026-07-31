import { } from "next/server";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    // Mocking summary data as the real implementation depends on complex log analysis
    // In a real scenario, these would be aggregated from interaction logs
    const totals = {
      totalInteractions: 1250,
      imageInteractions: 450,
      failedRecommendations: 12,
      openGapRequests: 5};

    const topIntents = [
      { intent: "Product Search", count: 450 },
      { intent: "Order Status", count: 320 },
      { intent: "Pricing Info", count: 210 },
      { intent: "Technical Support", count: 180 },
    ];

    const topGaps = [
      {
        keyword: "RTX 5090",
        queryCount: 45,
        lastRequested: new Date().toISOString()},
      {
        keyword: "DDR6 RAM",
        queryCount: 32,
        lastRequested: new Date().toISOString()},
    ];

    const dailyVolume = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: d.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 100) + 100};
    });

    return apiResponse.success({
      totals,
      topIntents,
      topGaps,
      dailyVolume});
  } catch (error) {
    console.error("AI Analytics Summary Error:", error);
    return apiResponse.error("Failed to fetch AI analytics summary");
  }
}
