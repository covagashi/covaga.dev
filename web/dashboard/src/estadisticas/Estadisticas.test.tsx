import { render, screen, fireEvent } from '@testing-library/react'
import { I18nProvider } from '../i18n'
import { Estadisticas } from './Estadisticas'

vi.mock('../api', () => ({
  getMatrix: async () => ({
    deliverables: ['photo', 'ul'], total: 10,
    rows: [{ manufacturer: 'Siemens', total: 10, missing: { photo: 5, ul: 8 } }], rest: null,
  }),
  getStats: async () => ({ total: 10, manufacturer_count: 1, coverage: { photo: 5, ul: 2 } }),
  getChanges: async () => ({ items: [], counts: { applied: 3, pending: 1 } }),
}))

it('celda de la matriz navega a la cola filtrada', async () => {
  window.location.hash = ''
  render(<I18nProvider><Estadisticas /></I18nProvider>)
  fireEvent.click((await screen.findAllByText('80%'))[0])
  expect(window.location.hash).toBe('#/materiales?missing=ul&mfr=siemens')
})

it('lead renderiza el total en negrita', async () => {
  render(<I18nProvider><Estadisticas /></I18nProvider>)
  const boldTotal = await screen.findByText('10')
  expect(boldTotal.tagName).toBe('B')
})
