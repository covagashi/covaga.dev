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
  (Microsoft Teams, email, webhook).

See `ARCHITECTURE.md` for the full map.

## Design — NO AI SLOP (non-negotiable, top priority)

**Using generic, invented, "AI-styled" UI is FORBIDDEN.** Every screen must match the
project's real, existing design — never improvise.

- **The mockups are the source of truth.** The owner designed the UI as HTML mockups
  (in the `eplanbridge` repo, `docs/mockups/`). Build against them, pixel-for-intent.
- **The events / automations page is mockup `C3` — "editor vertical (Zapier puro)"**:
  master–detail — the event list on the left; selecting an event shows its route as
  **3 vertical steps** (1 Origen = the EPLAN `.cs` script, 2 Nexo = byndr, 3 Destinos).
  It is NOT a CRUD form. (Other mockups A/B/D and canvas variants were explicitly
  rejected.)
- **Reuse, never regenerate.** If a screen already has a mockup or an existing
  implementation (e.g. the byndrrr app screens), port/match it exactly — do not
  redesign it.
- **Brand:** dark warm background, **Signal Orange `#f26419`** accent, **Space Grotesk**
  + **JetBrains Mono**, per the mockups. (The ported byndrrr screens use blue/Inter —
  that drift must be reconciled with the owner, not left mixed.)
- **7 LANGUAGES, ALWAYS (non-negotiable).** EVERY user-facing surface — the landing,
  the dashboard, every screen, label, message and empty state — must exist in ALL
  seven locales: **en, es, de, pt, ja, ko, zh-cn**, with a language switcher. No
  single-language screens. Wire i18n from the start (reuse the landing's `i18n/` and
  the byndrrr app's `dicts.ts`); a screen that is not fully translated is not done.
- If no design exists for something new, **ask the owner** — do not ship generic UI.

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
