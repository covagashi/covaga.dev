import { render, screen } from '@testing-library/react'
import { Materiales } from './Materiales'
import { I18nProvider } from '../i18n'

vi.mock('../api', () => ({
  getHealth: async () => ({ ok: true, snapshot: true, parts: 0, pat: false }),
  getFacets: async () => ({ manufacturers: [] }),
  fetchAllParts: async () => [],
  dpCheck: async () => ({}),
  createChange: async () => ({ id: 'x' }),
}))

vi.mock('./QueuesRail', () => ({ QueuesRail: () => null }))

beforeEach(() => localStorage.setItem('byndr.lang', 'es'))

it('cola vacia ya cargada muestra el estado limpio, no una tabla en blanco', async () => {
  render(<I18nProvider><Materiales /></I18nProvider>)
  expect(await screen.findByText(/esta cola está limpia/)).toBeInTheDocument()
})
