import { buildGroups } from './groups'
import type { Part } from '../api'

const base = { part_number: 'X', variant: '', manufacturer: 'M',
  description_i18n: { es_ES: 'hola' }, has_ul: false, ul_value: '',
  has_erp: true, erp_number: '100482', has_ce: true, ce_value: '✓',
  current_iec: '24 A' } as unknown as Part

it('erp nunca es editable; ul faltante si es', () => {
  const groups = buildGroups(base)
  const all = groups.flatMap(g => g.fields)
  const erp = all.find(f => f.apiName === 'ARTICLE_ERPNR')!
  expect(erp.editable).toBe(false)
  expect(erp.value).toBe('100482')
  const ul = all.find(f => f.apiName === 'ARTICLE_CERTIFICATE_UL')!
  expect(ul.editable).toBe(true)
  expect(ul.state).toBe('missing')
})

it('grupo sin datos queda marcado empty', () => {
  const groups = buildGroups(base)
  const dims = groups.find(g => g.title === 'g.dimensiones')!
  expect(dims.empty).toBe(true)
})
