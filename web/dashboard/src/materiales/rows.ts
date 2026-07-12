import type { Part } from '../api'

export type Row =
  | { type: 'group'; manufacturer: string; count: number }
  | { type: 'part'; part: Part }
  | { type: 'expand'; part: Part }

export function buildRows(parts: Part[]): Row[] {
  const rows: Row[] = []
  let current = ''
  let groupIdx = -1
  for (const part of parts) {
    const m = part.manufacturer || '(sin fabricante)'
    if (m !== current) {
      current = m
      groupIdx = rows.length
      rows.push({ type: 'group', manufacturer: m, count: 0 })
    }
    ;(rows[groupIdx] as any).count++
    rows.push({ type: 'part', part })
  }
  return rows
}
