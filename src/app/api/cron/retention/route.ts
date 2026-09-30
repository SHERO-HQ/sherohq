import { runRetention } from "@/lib/retention";

// Vercel Cron calls this daily with "Authorization: Bearer $CRON_SECRET".
// Without CRON_SECRET set, it refuses every call.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const removed = await runRetention();
  return Response.json({ ok: true, removed });
}
