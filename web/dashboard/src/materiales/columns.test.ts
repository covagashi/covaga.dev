import { COLUMN_VIEWS } from './columns'
import { es } from '../i18n/dicts'
import type { Part } from '../api'

it('la vista electrica usa los campos ampliados del snapshot', () => {
  const cols = COLUMN_VIEWS.electrica
  const keys = cols.map(c => c.key)
  expect(keys).toEqual(expect.arrayContaining(['current_iec', 'current_ul', 'protection_degree']))
  const part = { current_iec: '24 A', current_ul: '' } as Part
  const iec = cols.find(c => c.key === 'current_iec')!
  expect(iec.value(part)).toBe('24 A')
})

it('certificados marca ul faltante como hueco', () => {
  const ul = COLUMN_VIEWS.certificados.find(c => c.key === 'ul_value')!
  expect(ul.missing!({ has_ul: false } as Part)).toBe(true)
  expect(ul.missing!({ has_ul: true, ul_value: 'E1234' } as Part)).toBe(false)
})

it('la vista comercial muestra erp con candado y solo lectura', () => {
  const erp = COLUMN_VIEWS.comercial.find(c => c.key === 'erp_number')!
  expect(erp.label).toBe('col.erp')
  expect(es['col.erp']).toContain('🔒')
  expect(Object.keys(erp)).not.toContain('editable')
  expect(erp.missing).toBeUndefined()
})
