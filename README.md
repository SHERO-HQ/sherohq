# sherohq.com

SHERO's public website (and, later in the rebuild, the admin dashboard).

Start with [`CLAUDE.md`](CLAUDE.md): it explains the product docs in `docs/`, the design system and page designs in `design/`, and the rules the code must keep.

```bash
corepack enable
yarn install
yarn dev          # http://localhost:3000
yarn tokens       # regenerate src/styles/tokens.css after design/system/tokens.json changes
yarn lint && yarn typecheck && yarn test && yarn build
```

Copy `.env.example` to `.env.local` for local settings.
