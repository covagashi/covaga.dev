# CLAUDE.md — working rules for byndr-dev

Instructions for any AI agent (and humans) working in this repository. This is a
public, community project: keep it clean, typed, and well organized.

## What this is

An open platform for EPLAN teams, built on Cloudflare. Two pillars:

- **Data + Gym** — ingest an article-database snapshot, then let an LLM close text
  gaps (translations, descriptions) through an **MCP** server whose validators are
  deterministic and server-side. Proposals are reviewed like pull requests; approved
  changes are written back to EPLAN by a local polling client.
- **Automations** — EPLAN events (PDF/BOM/project) routed to destinations
  (Slack/Drive/webhook).

See `ARCHITECTURE.md` for the full map.

## Hard rules (non-negotiable)

1. **TypeScript `strict`. Never use `any`.** If a type is unknown, use `unknown` and
   narrow it. No `as any`, no implicit any.
2. **Never use `null`.** Use `undefined` for absence. Repositories return
   `T | undefined`.
3. **Layering:** router → service → repository → D1. Pure logic (crypto, validators)
   lives in `src/lib/` as dependency-free, unit-tested modules.
4. **Tests are required.** Vitest. Practice TDD for pure logic (validators, crypto).
   Get `npm run typecheck` and `npm test` green before committing.
5. **Idempotent D1 migrations** (`CREATE TABLE IF NOT EXISTS`, etc.).
6. **No secrets or real data in git.** API keys go in Wrangler secrets / `.dev.vars`;
   real article data lives only in a private D1, never in the repo.
7. **Explicit return types** on exported functions; a concise doc comment on each.
8. **Small, focused files.** One responsibility per module.
9. **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`…). Small, reviewable
   changes.

## Commands

```bash
npm run dev        # wrangler dev (local)
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run deploy     # wrangler deploy (maintainers only)
```

## Boundaries

- The cloud **never writes to EPLAN directly**. It only produces proposals and a
  write queue; a local client applies approved changes.
- The gym is **overlay, never mutation**: its only output is proposal rows.
- Validation is server-side; an LLM proposes, the validator decides.
