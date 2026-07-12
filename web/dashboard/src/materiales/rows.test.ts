import { buildRows } from './rows'
import type { Part } from '../api'

const p = (pn: string, mfr: string) => ({ part_number: pn, manufacturer: mfr } as Part)

it('inserta cabecera por cada fabricante con su cuenta', () => {
  const rows = buildRows([p('A1', 'ABB'), p('A2', 'ABB'), p('S1', 'Siemens')])
  expect(rows).toEqual([
    { type: 'group', manufacturer: 'ABB', count: 2 },
    { type: 'part', part: p('A1', 'ABB') },
    { type: 'part', part: p('A2', 'ABB') },
    { type: 'group', manufacturer: 'Siemens', count: 1 },
    { type: 'part', part: p('S1', 'Siemens') },
  ])
})

it('lista vacia → sin filas', () => {
  expect(buildRows([])).toEqual([])
})

it('fabricante vacío se agrupa como (sin fabricante)', () => {
  const rows = buildRows([p('X1', ''), p('X2', '')])
  expect(rows[0]).toEqual({ type: 'group', manufacturer: '(sin fabricante)', count: 2 })
  expect(rows).toHaveLength(3)
})
