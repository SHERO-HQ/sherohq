import { NextRequest } from "next/server";
import { apiResponse, validateCronAuth } from "@/lib/api-utils";
import { processCleanupPendingOrdersTask } from "@/lib/cron-tasks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronError = validateCronAuth(request);
  if (cronError) return cronError;

  const result = await processCleanupPendingOrdersTask();
  return apiResponse.success(result);
}

export async function POST(request: NextRequest) {
  const cronError = validateCronAuth(request);
  if (cronError) return cronError;

  const result = await processCleanupPendingOrdersTask();
  return apiResponse.success(result);
}
