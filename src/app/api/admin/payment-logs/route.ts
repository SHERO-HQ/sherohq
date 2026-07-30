import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const limit = Math.min(Number(searchParams.get("limit") || 500), 1000);

    const result = await query(
      `SELECT id, action, type, details, "adminId", "createdAt"
       FROM activity_logs
       WHERE action LIKE '%payment%' OR action LIKE 'order_%'
       ORDER BY "createdAt" DESC
       LIMIT $1`,
      [limit]
    );

    if (format === "csv") {
      const rows = result.rows;
      const headers = ["ID", "Action", "Type", "Details", "Timestamp"];
      const csvRows = [
        headers.join(","),
        ...rows.map((r) =>
          [
            `"${r.id}"`,
            `"${r.action}"`,
            `"${r.type}"`,
            `"${(r.details || "").replace(/"/g, '""')}"`,
            `"${r.createdAt}"`,
          ].join(",")
        ),
      ];

      return new NextResponse(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="payment-logs-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return apiResponse.success({
      count: result.rowCount,
      logs: result.rows,
    });
  } catch (error) {
    console.error("Fetch payment logs error:", error);
    return apiResponse.error("Failed to fetch payment logs");
  }
}
