import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { consultations } from "@/lib/drizzle/schema";
import { and, inArray, sql } from "drizzle-orm";
import { apiResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return apiResponse.error("Date parameter is required", 400);
    }

    // Parse the date and establish midnight-to-midnight boundary in UTC/Local
    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return apiResponse.error("Invalid date format", 400);
    }

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const datePrefix = `${year}-${month}-${day}`;

    // Query active bookings for the specified date
    const bookedRows = await db
      .select({
        time: consultations.time,
      })
      .from(consultations)
      .where(
        and(
          inArray(consultations.status, ["pending", "confirmed"]),
          sql`TO_CHAR(${consultations.date}, 'YYYY-MM-DD') = ${datePrefix}`,
        ),
      );

    const bookedTimes = bookedRows.map((r) => r.time);

    return apiResponse.success({
      date: datePrefix,
      bookedTimes,
    });
  } catch (error) {
    console.error("Fetch availability error:", error);
    return apiResponse.error("Failed to fetch availability", 500);
  }
}
