# Contributing to byndr-dev

Thanks for your interest! This is an early, community-driven project. Contributions
of code, docs, and issues are all welcome.

## Setup

```bash
npm install
npm test
npm run typecheck
```

You need Node 20+ and (for local runs) the Cloudflare Wrangler CLI, installed as a
dev dependency.

## Coding rules

These are enforced in review (see `CLAUDE.md` for the full list):

- **TypeScript `strict`. No `any`** — use `unknown` and narrow.
- **No `null`** — use `undefined` for absence.
- **Layering:** router → service → repository → D1. Pure logic in `src/lib/`.
- **Tests required** (Vitest). Practice TDD for pure logic (validators, crypto).
- **Explicit return types** and a doc comment on every exported function.
- **Idempotent** D1 migrations.
- **No secrets or real data** in commits.

## Workflow

1. Fork and branch from `main` (`feat/…`, `fix/…`, `docs/…`).
2. Make a small, focused change with tests.
3. Ensure `npm run typecheck` and `npm test` are green.
4. Use [Conventional Commits](https://www.conventionalcommits.org/) for messages.
5. Open a pull request describing what and why.

## Reporting issues

Open an issue with steps to reproduce, expected vs. actual behavior, and environment
details. For security-sensitive reports, please contact the maintainer privately
rather than opening a public issue.
