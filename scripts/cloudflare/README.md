# Cloudflare Worker: WhatsApp Retry Trigger

Overview

- This Worker calls your retry endpoint at `RETRY_URL` with an optional `Authorization: Bearer <CRON_SECRET>` header.
- Intended to be scheduled using Cloudflare Cron Triggers (free tier available).

Files

- `whatsapp-retry-worker.js` — Worker script.

Deploy with Wrangler (recommended)

1. Install Wrangler:

```bash
npm install -g wrangler
# or
corepack prepare yarn@stable --activate && yarn global add wrangler
```

1. Create `wrangler.toml` in a secure place (not checked into repo unless safe):

```toml
name = "whatsapp-retry-trigger"
main = "./scripts/cloudflare/whatsapp-retry-worker.js"
compatibility_date = "2026-01-01"

[env.production]
# Bindings for production
vars = { RETRY_URL = "https://sherohq.com/api/cron/whatsapp-retry", CRON_SECRET = "your-secret-here" }

[[triggers.crons]]
schedule = "*/10 * * * *" # every 10 minutes
```

1. Publish (preview first):

```bash
wrangler publish --env production
```

Configure Cron Trigger via Cloudflare Dashboard (alternate)

- Go to your Cloudflare account > Workers > your Worker > Triggers > Cron Triggers.
- Add a schedule `*/10 * * * *` and select the Worker.

Security / IP allowlisting

- Cloudflare runs the Worker from Cloudflare's IPs; if you want to allowlist callers on your server, allow Cloudflare ranges or use a request signing header.

Signing requests (recommended)

- Instead of IP allowlisting, keep using `CRON_SECRET` header (Authorization: Bearer ...). Cloudflare keeps secrets in `wrangler.toml` or dashboard Secrets.

Testing

- Manual trigger (dev):

  `wrangler dev --env production` and then visit the worker URL.

- Manual POST test:

  ```bash
  curl -X POST https://<your-worker-subdomain>.workers.dev/ -H "Authorization: Bearer <secret>"
  ```

Notes

- Cloudflare Workers free tier provides Cron Triggers and is ideal for running small scheduled HTTP calls with low latency and reliable scheduling.
- If you want me to create the `wrangler.toml` and add a GitHub Actions step to auto-deploy on push, I can add those files next.
