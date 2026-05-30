// src/app/api/cron/whatsapp-retry/route.ts
import { NextResponse } from "next/server";
import { processPendingRetries } from "../../../../../lib/whatsapp-retry";

export async function GET(req: Request) {
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET)
    return new Response("Unauthorized", { status: 401 });

  try {
    const result = await processPendingRetries();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 },
    );
  }
}
