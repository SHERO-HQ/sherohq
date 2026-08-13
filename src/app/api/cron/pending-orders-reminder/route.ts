import { NextRequest } from "next/server";
import { apiResponse, validateCronAuth } from "@/lib/api-utils";
import { processPendingOrdersRemindersTask } from "@/lib/cron-tasks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronError = validateCronAuth(request);
  if (cronError) return cronError;

  const result = await processPendingOrdersRemindersTask();
  return apiResponse.success(result);
}

export async function POST(request: NextRequest) {
  const cronError = validateCronAuth(request);
  if (cronError) return cronError;

  const result = await processPendingOrdersRemindersTask();
  return apiResponse.success(result);
}
