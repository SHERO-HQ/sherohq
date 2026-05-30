/**
 * Cloudflare Worker: whatsapp-retry-trigger
 * - Sends a POST to your retry endpoint with Authorization header
 * - Designed to be scheduled via Cloudflare Cron Triggers
 *
 * Environment bindings:
 * - RETRY_URL (required) e.g. https://sherohq.com/api/cron/whatsapp-retry
 * - CRON_SECRET (optional) secret to send as Bearer token
 */

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

addEventListener("scheduled", (event) => {
  event.waitUntil(handleScheduled(event));
});

async function handleScheduled(event) {
  try {
    return await triggerRetry();
  } catch (err) {
    console.error("Scheduled trigger failed:", err);
    return null;
  }
}

async function handleRequest(req) {
  // Allow quick manual test via GET
  if (req.method === "GET") {
    const res = await triggerRetry();
    return new Response(JSON.stringify({ ok: true, res }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // POST also triggers
  if (req.method === "POST") {
    const res = await triggerRetry();
    return new Response(JSON.stringify({ ok: true, res }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
}

async function triggerRetry() {
  const RETRY_URL =
    RETRY_URL_BINDING ||
    (typeof RETRY_URL !== "undefined" ? RETRY_URL : undefined);
  // Cloudflare Wrangler exposes env via global bindings; when deploying, bind RETRY_URL and CRON_SECRET
  const url =
    typeof RETRY_URL_BINDING !== "undefined"
      ? RETRY_URL_BINDING
      : typeof RETRY_URL !== "undefined"
        ? RETRY_URL
        : undefined;

  // Fallback: read from global, which will be injected via Wrangler's `bindings` (or use env during dev)
  const retryUrl = url || RETRY_URL;
  const cronSecret =
    typeof CRON_SECRET !== "undefined" ? CRON_SECRET : undefined;

  if (!retryUrl) throw new Error("RETRY_URL binding not configured");

  const headers = {
    "Content-Type": "application/json",
  };
  if (cronSecret) headers["Authorization"] = `Bearer ${cronSecret}`;

  const resp = await fetch(retryUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      triggeredBy: "cloudflare-cron",
      ts: new Date().toISOString(),
    }),
  });

  const text = await resp.text();
  const out = {
    status: resp.status,
    ok: resp.ok,
    bodySnippet: text?.slice(0, 1000),
  };
  if (!resp.ok) console.error("Retry endpoint returned non-ok", out);
  return out;
}
