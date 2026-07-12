# byndr-dev

An open platform for EPLAN teams, built on Cloudflare — **data enrichment** and
**automations** in one place.

> Status: early. Building the foundation (Etapa 1). See `ARCHITECTURE.md` for the
> roadmap.

## Why

EPLAN article databases are full of gaps: missing translations and descriptions.
And useful events (a PDF export, a BOM change) never leave the desktop. byndr-dev
tackles both:

- **Data + Gym.** Ingest a read-only snapshot of your article database, then let an
  LLM close **text** gaps (translations, descriptions) through an **MCP** server.
  The validators are deterministic and run on the server — the model proposes, the
  server decides. Proposals are reviewed like pull requests; once a human approves,
  the change is queued and a small local client writes it back into EPLAN.
- **Automations.** Route EPLAN events to Slack, Drive, or a webhook.

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

## Contributing

Contributions welcome — please read `CONTRIBUTING.md`. In short: TypeScript strict,
no `any`, no `null`, tests green, Conventional Commits.

## License

[MIT](LICENSE).
