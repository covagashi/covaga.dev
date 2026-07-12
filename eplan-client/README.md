# byndr event client (EPLAN → automations)

An EPLAN P8 script that forwards events to your byndr-dev tenant. The server then
routes each event to your destinations (Teams / webhook). No destination secrets or
integration logic live on the PC — only capture and delivery.

`POST {SERVER_URL}/hook/{TENANT_ID}/{eventId}` with header `X-Api-Key`.

## Setup

1. Create a tenant in the dashboard and copy your **API key** (shown once).
2. In `ByndrEventClient.cs`, set `TENANT_ID`, `API_KEY` (and `SERVER_URL` if self-hosting).
3. EPLAN → Utilidades → Scripts → **Cargar** `ByndrEventClient.cs`. You should see
   "byndr event client: cargado…". It listens while the script is loaded.

## Two ways to emit

- **Reliable (works today):** run the action **`ByndrEventTest`** to send a fake
  `pdf-exported` and confirm the HTTP path, or **`ByndrEmit <eventId>`** (e.g. wire
  your export macro to call `ByndrEmit pdf-exported`). Uses only `[DeclareAction]`,
  which is stable across versions.
- **Auto-capture (confirm first):** the `OnPostAction` handler subscribes to
  `OnUserPostAction` via `[DeclareEventHandler]` (mechanism confirmed against the
  EPLAN 2026 API) and maps the action name to an event id.

## What needs confirming in your EPLAN (can't be tested outside EPLAN)

The **mechanism** (`[DeclareEventHandler("...")]`, `[DeclareAction]`, the HTTP POST)
is solid and mirrors the working `ByndrDbSnapshot.cs` / `ByndrDbBridge.cs`. What to
verify on a real installation:

1. **Event name** — that `Eplan.EplApi.OnUserPostAction` is the right event to catch
   post-action in your version (adjust `POST_ACTION_EVENT` otherwise; wildcards like
   `"...*"` are supported).
2. **Action name extraction** — `ExtractActionName` is a defensive best-effort;
   confirm how your version exposes the action name on `IEventParameter` and refine
   `MapAction` to your real action names (pdf / partslist / backup…).

Until (1) and (2) are confirmed, use the reliable `ByndrEmit` / `ByndrEventTest` path
— it needs no event-name guessing.

## Known events (server side)

`pdf-exported`, `bom-exported`, `project-closed`, `bom-changed`. Configure which
destinations they route to in the dashboard (or via `POST /api/routes`).
