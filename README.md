# byndr-dev

An open platform for EPLAN teams, built on Cloudflare — **data enrichment** and
**automations** in one place.

> ⚠️ **Work in progress — largely conceptual.** The design below describes where
> this is going; only the **Foundation (Stage 1)** is implemented today. Interfaces
> and scope will change. See `ARCHITECTURE.md` for the roadmap.

## Why

EPLAN article databases are full of gaps: missing translations and descriptions.
And useful events (a PDF export, a BOM change) never leave the desktop. byndr-dev
tackles both:

- **Data + Gym.** Ingest a read-only snapshot of your article database, then let an
  LLM close **text** gaps (translations, descriptions) through an **MCP** server.
  The validators are deterministic and run on the server — the model proposes, the
  server decides. Proposals are reviewed like pull requests; once a human approves,
  the change is queued and a small local client writes it back into EPLAN.
- **Automations.** Route EPLAN events (PDF/BOM exports, project events) to where an
  engineering team actually looks — Microsoft Teams, email, a shared drive, or a
  plain webhook you control.

## Principles

- **The cloud never writes to EPLAN.** It produces proposals and a write queue; a
  local client applies only human-approved changes.
- **Overlay, never mutation.** The gym's only output is proposals; it never edits
  ingested data.
- **Your data stays yours.** Real article data lives in a private database, never in
  this repository. You bring your own.
- **Per-tenant** from day one.

## Quickstart (development)

```bash
npm install
npm run dev          # local worker
npm test             # run the test suite
```

Create a tenant (prints its API key once):

```bash
node scripts/create-tenant.mjs "My Team"
```

## Self-hosting

byndr-dev runs on Cloudflare (Workers + D1 + Durable Objects); deploy it to your own
Cloudflare account with Wrangler (see Quickstart). For teams that cannot use the
cloud, a fully-local runtime via `workerd` / Miniflare — the same runtime the test
suite already uses — is on the roadmap. Note: Wrangler configuration uses TOML or
JSON(C), **not YAML**.

## Contributing

Contributions welcome — please read `CONTRIBUTING.md`. In short: TypeScript strict,
no `any`, no `null`, tests green, Conventional Commits.

## License

[MIT](LICENSE).
