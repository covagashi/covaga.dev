// helpers puros (testeados).

// confianza 0..1 → porcentaje entero.
export function confidencePct(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

// nivel de confianza para colorear: alta (ok) / media (warn) / baja (err).
export function confidenceLevel(confidence: number): 'alta' | 'media' | 'baja' {
  if (confidence >= 0.8) return 'alta'
  if (confidence >= 0.5) return 'media'
  return 'baja'
}

// alterna la pertenencia de un id en un conjunto, devolviendo uno nuevo (inmutable).
export function toggle(ids: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(ids)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

// valor vacío como marca visible en el diff.
export function shown(value: string): string {
  return value === '' ? '∅' : value
}

// fecha iso → hora local corta; devuelve el original si no parsea.
export function shortTime(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso
  return new Date(t).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}
