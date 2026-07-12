// persistencia de la sesión (base del worker + clave del tenant) en localStorage.

export const DEFAULT_BASE = 'https://byndr-dev.clopez-5fd.workers.dev'

const BASE_KEY = 'byndr.dash.base'
const KEY_KEY = 'byndr.dash.key'
const TENANT_KEY = 'byndr.dash.tenant'

export interface Session {
  base: string
  key: string
  tenant: string
}

export function loadSession(): Session | undefined {
  const base = localStorage.getItem(BASE_KEY) ?? undefined
  const key = localStorage.getItem(KEY_KEY) ?? undefined
  const tenant = localStorage.getItem(TENANT_KEY) ?? undefined
  if (base === undefined || key === undefined || tenant === undefined) return undefined
  return { base, key, tenant }
}

export function saveSession(s: Session): void {
  localStorage.setItem(BASE_KEY, s.base)
  localStorage.setItem(KEY_KEY, s.key)
  localStorage.setItem(TENANT_KEY, s.tenant)
}

export function clearSession(): void {
  localStorage.removeItem(BASE_KEY)
  localStorage.removeItem(KEY_KEY)
  localStorage.removeItem(TENANT_KEY)
}
