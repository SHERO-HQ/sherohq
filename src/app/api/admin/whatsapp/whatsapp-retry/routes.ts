import { apiResponse } from "@/lib/api-utils";
// src/app/api/cron/whatsapp-retry/route.ts
import { processPendingRetries } from "../../../../../lib/whatsapp-retry";

export async function GET(req: Request) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET)
    return new Response("Unauthorized", { status: 401 });

  try {
    const result = await processPendingRetries();
    return apiResponse.success(result);
  } catch (err: any) {
    return apiResponse.error(err?.message ?? String(err), 500);
  }
}
