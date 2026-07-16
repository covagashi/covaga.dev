# Architecture

Covaga Hub is a Cloudflare-native, multi-tenant platform with two pillars sharing one
database and one auth model. It is fed by small clients running next to EPLAN on the
user's machine; the cloud never touches EPLAN directly.

## Pillars

- **Data + Gym** — a read-only snapshot of the article database is ingested into D1.
  An MCP server exposes gap-closing **tasks** (translations, descriptions) and
  **deterministic validators**. An external LLM client iterates: it asks for a task,
  reads article context, and submits a value; the server validates and, on success,
  records a **proposal**. A human reviews proposals like pull requests; approved ones
  enter a **write queue** that a local client applies back into EPLAN.
- **Automations** — EPLAN events (PDF exported, BOM exported, project closed) are
  posted to the platform and routed to destinations (Microsoft Teams, email, a shared drive, or a webhook).

## Flow

```
Desktop (EPLAN)
  ├── snapshot client ──POST /ingest (X-Api-Key)──► articles (D1)
  ├── event client    ──POST /hook/:tenant/:event─► dispatcher ──► Teams/email/…
  └── write client (polling) ──GET /write/poll─────► applies approved changes ──► EPLAN
                              ◄─POST /write/result──

Cloudflare Worker(s)
  ├── shared auth: X-Api-Key → SHA-256 → tenants (D1)
  ├── Gym MCP (Durable Object): next_task · get_article · submit · metrics
  │        ▲ MCP over HTTP/SSE
  │   LLM client (e.g. Claude)
  └── D1: tenants, articles, proposals, episodes, write_queue,
          destinations, event_routes, executions
```

## Stack

- **Cloudflare Workers** (TypeScript), **D1** (SQLite), **Durable Objects** (MCP
  session state), the **Agents SDK** for the MCP server.
- Layered code: router → service → repository → D1. Validators are pure, dependency-
  free, unit-tested modules.
- Auth: per-tenant API key (`X-Api-Key` → SHA-256 → `tenants.api_key_hash`), uniform
  401 (no tenant enumeration).

## Invariants

- The cloud never writes to EPLAN; a local client applies **human-approved** changes.
- The gym is overlay-only: its sole output is proposal rows.
- Validation is server-side and deterministic.
- Secrets and real data never enter the repository.

## Roadmap (stages)

| Stage | Scope |
|---|---|
| 1 · Foundation | Worker + D1 + `tenants` + API-key auth + `/health` + create-tenant |
| 2 · Ingest | `/ingest` endpoint receiving the snapshot client → `articles` |
| 3 · Gym MCP | MCP server + tools + `translate`/`describe` validators + episodes/metrics |
| 4 · Review + write queue | review proposals as PRs → approve → queue → local client applies |
| 5 · Automations | event dispatcher → destinations (Teams/email/webhook) |

Non-goals for now: certificates and photo gaps, OAuth (API-key per tenant is enough),
billing, fine-grained rate limiting.
