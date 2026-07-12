// Cliente http contra el worker byndr-dev alojado (o un autohospedado).
// Rewire respecto al app local: base configurable desde la sesión + cabecera
// X-Api-Key en cada petición. Los paths y las firmas de las funciones se
// mantienen EXACTAMENTE como en el app para no tocar las pantallas.
import { DEFAULT_BASE, loadSession, type Session } from './session'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Tipos: copiar EXACTAMENTE el bloque "Interfaces → Produces" de esta tarea.
// (Part, QueueFilter, Queue, ChangeItem, Changeset, Health)

export type Part = {
  part_number: string; variant: string; manufacturer: string;
  order_number: string; description: string;
  description_i18n: Record<string, string>;
  product_group: string;
  has_photo: boolean; photo_path: string; has_macro: boolean; macro_path: string;
  has_erp: boolean; erp_number: string; has_ce: boolean; ce_value: string;
  has_ul: boolean; ul_value: string; has_description: boolean;
  is_discontinued: boolean; last_change: string;
  dp: 'found' | 'missing' | null;
  // opcionales (snapshot ampliado, Task 6 del plan A):
  descr2?: string; descr3?: string; characteristics?: string;
  certificate?: string; vde_value?: string; atex_value?: string; ul_cnn?: string;
  height?: string; width?: string; depth?: string; weight?: string;
  color?: string; material?: string; mounting_site?: string;
  cross_section_from?: string; cross_section_till?: string;
  awg_from?: string; awg_till?: string; current_iec?: string; current_ul?: string;
  connection_method?: string; protection_degree?: string; graphic_macro?: string;
  doc1_name?: string; doc1_url?: string; supplier?: string; purchase_price?: string;
}
export type QueueFilter = Partial<Record<'q'|'mfr'|'grp'|'missing'|'dp'|'discontinued', string>>
export type Queue = { id: string; label: string; count: number; filter: QueueFilter }
export type ChangeItem = { part_number: string; variant?: string; field: string; lang?: string; old?: string; new: string }
export type Changeset = { id: string; status: string; title: string; author: string; created: string; items: Required<ChangeItem>[]; job_id: string | null; last_result: any }
export type Health = {
  ok: boolean; snapshot: boolean; parts: number; pat: boolean
  // C4: estado del bridge de escritura eplan (poll cada 2s) y del último job aplicado.
  bridge_last_poll?: string | null; last_write_dry_run?: boolean | null; pending_changes?: number
}

// Automatizaciones (solo byndr-dev). Formas defensivas: el backend se está
// construyendo para casar con estos shapes; las pantallas degradan si faltan.
export type Destination = { id: string; name: string; kind: string; url: string }
export type AutomationRoute = { id: string; event: string; destination_id: string; destination?: string }
export type Execution = { id: string; event: string; destination: string; status: string; at: string }

const PAGE = 200

const trimBase = (b: string) => b.replace(/\/+$/, '')
const currentBase = () => trimBase(loadSession()?.base ?? DEFAULT_BASE)
const currentKey = () => loadSession()?.key ?? ''

// núcleo: todas las peticiones autenticadas van con X-Api-Key desde la sesión.
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(currentBase() + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': currentKey(),
      ...(init?.headers ?? {}),
    },
  })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new ApiError(r.status, (body as { error?: string }).error || `http ${r.status}`)
  return body as T
}

// como req pero contra una base/clave dadas: para el gate (aún sin sesión).
async function authReq<T>(base: string, key: string, path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(trimBase(base) + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': key, ...(init?.headers ?? {}) },
  })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new ApiError(r.status, (body as { error?: string }).error || `http ${r.status}`)
  return body as T
}

// endpoints públicos (alta de cuenta): sin clave.
async function publicReq<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(trimBase(base) + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  const body = await r.json().catch(() => ({}))
  if (!r.ok) throw new ApiError(r.status, (body as { error?: string }).error || `http ${r.status}`)
  return body as T
}

const qs = (f: Record<string, string | undefined>) =>
  Object.entries(f).filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join('&')

// ── auth / sesión ──────────────────────────────────────────────────────────
export type WhoAmI = { id: string }
export type Plans = { plans: string[] }
export type SignupResult = { ok: boolean; tenant_id: string; api_key: string }

export const whoami = (base: string, key: string) => authReq<WhoAmI>(base, key, '/whoami')
export const getPlans = (base: string) => publicReq<Plans>(base, '/api/plans')
export const signup = (base: string, email: string, plan: string) =>
  publicReq<SignupResult>(base, '/api/signup', { method: 'POST', body: JSON.stringify({ email, plan }) })
// rota la clave del tenant actual y devuelve la nueva (la sesión debe actualizarse).
export const rotateKey = () =>
  req<{ api_key: string }>('/api/tenant/rotate-key', { method: 'POST', body: '{}' })

// ── datos del app (mismos paths que ya usaba) ───────────────────────────────
export const getHealth = () => req<Health>('/api/health')
export const getQueues = () => req<{ system: Queue[]; saved: Queue[] }>('/api/queues')
export const createQueue = (label: string, filter: QueueFilter) =>
  req<{ id: string }>('/api/queues', { method: 'POST', body: JSON.stringify({ label, filter }) })
export const deleteQueue = (id: string) =>
  req<void>(`/api/queues/${id}`, { method: 'DELETE' })
export const getFacets = (f: QueueFilter) =>
  req<{ manufacturers: { name: string; count: number }[] }>(`/api/parts/facets?${qs(f)}`)
export const getMatrix = () => req<any>('/api/stats/matrix')
export const getStats = () => req<any>('/api/stats')

export async function fetchAllParts(
  f: QueueFilter, onProgress?: (loaded: number, total: number) => void,
): Promise<Part[]> {
  const out: Part[] = []
  let offset = 0, total = Infinity
  while (offset < total) {
    const page = await req<{ total: number; items: Part[] }>(
      `/api/parts?${qs({ ...f, sort: 'mfr', limit: String(PAGE), offset: String(offset) })}`)
    total = page.total
    out.push(...page.items)
    offset += page.items.length
    onProgress?.(out.length, total)
    if (!page.items.length) break
  }
  return out
}

export const getChanges = (status?: string) =>
  req<{ items: Changeset[]; counts: Record<string, number> }>(
    `/api/changes${status ? `?status=${status}` : ''}`)
export const createChange = (title: string, author: string, items: ChangeItem[]) =>
  req<{ id: string }>('/api/changes', { method: 'POST', body: JSON.stringify({ title, author, items }) })
export const approveChange = (id: string) =>
  req<void>(`/api/changes/${id}/approve`, { method: 'POST', body: '{}' })
export const rejectChange = (id: string, reason = '') =>
  req<void>(`/api/changes/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
export const applyChanges = () =>
  req<{ queued: { change_id: string; job_id: string }[] }>(
    '/api/changes/apply', { method: 'POST', body: '{}' })
export const getGymStatus = () => req<any>('/api/gym/status')
export const getSettings = () => req<{ require_l0_approval: boolean }>('/api/settings')
export const setSettings = (s: { require_l0_approval: boolean }) =>
  req<void>('/api/settings', { method: 'POST', body: JSON.stringify(s) })

// ── dataportal: byndr-dev aún no lo tiene. Estas llamadas fallan de forma
// controlada (lanzan ApiError) y la pantalla cesta muestra su estado de error
// existente en vez de romper el app. ────────────────────────────────────────
export const dpCheck = (pns: string[]) =>
  req<any>('/api/dataportal/check', { method: 'POST', body: JSON.stringify({ part_numbers: pns }) })
export const getBasket = () => req<any>('/api/dataportal/basket')
export const removeBasketItem = (id: string) =>
  req<void>(`/api/dataportal/basket/${id}`, { method: 'DELETE' })

// ── automatizaciones (solo byndr-dev) ───────────────────────────────────────
export const getDestinations = () => req<{ destinations: Destination[] }>('/api/destinations')
export const createDestination = (d: { name: string; kind: string; url: string }) =>
  req<{ id: string }>('/api/destinations', { method: 'POST', body: JSON.stringify(d) })
export const getRoutes = () => req<{ routes: AutomationRoute[] }>('/api/routes')
export const createRoute = (r: { event: string; destination_id: string }) =>
  req<{ id: string }>('/api/routes', { method: 'POST', body: JSON.stringify(r) })
export const getExecutions = () => req<{ executions: Execution[] }>('/api/executions')

export type { Session }
