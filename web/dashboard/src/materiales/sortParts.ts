export type SortDir = 'asc' | 'desc'

/**
 * Ordena una copia de `items` segun `value(item)`.
 * - Si ambos valores comparados parsean a numero (parseFloat), compara numericamente.
 *   parseFloat toma el prefijo numerico de la cadena (p.ej. "24 A" -> 24); es una
 *   simplificacion deliberada — no se despojan unidades de otra forma, y si el
 *   prefijo no es numerico (parseFloat -> NaN) se cae al orden alfabetico.
 * - Si no, usa localeCompare('es') (orden alfabetico español, agrupa acentos con su
 *   letra base).
 * No muta `items`.
 */
export function sortParts<T>(items: T[], value: (item: T) => string, dir: SortDir): T[] {
  const sign = dir === 'asc' ? 1 : -1
  return [...items].sort((a, b) => {
    const av = value(a)
    const bv = value(b)
    const an = parseFloat(av)
    const bn = parseFloat(bv)
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return (an - bn) * sign
    return av.localeCompare(bv, 'es') * sign
  })
}
