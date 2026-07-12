import { useSyncExternalStore } from 'react'

export const SECTIONS = ['materiales', 'estadisticas', 'cesta', 'cambios', 'gym', 'automatizaciones', 'ajustes'] as const
export type Route = { section: string; param: string | null; query: Record<string, string> }

const safeDecode = (s: string) => {
  try { return decodeURIComponent(s) } catch { return s }
}

export function parseHash(hash: string): Route {
  const [path, qs = ''] = hash.replace(/^#\/?/, '').split('?')
  const [section = '', ...rest] = path.split('/')
  const query: Record<string, string> = {}
  for (const [k, v] of new URLSearchParams(qs)) query[k] = v
  if (!(SECTIONS as readonly string[]).includes(section))
    return { section: 'materiales', param: null, query: {} }
  return { section, param: rest.length ? safeDecode(rest.join('/')) : null, query }
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export const useRoute = (): Route =>
  parseHash(useSyncExternalStore(subscribe, () => window.location.hash))

export const navigate = (hash: string) => { window.location.hash = hash }
