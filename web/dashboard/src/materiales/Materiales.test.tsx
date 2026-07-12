import { render, screen } from '@testing-library/react'
import { Materiales } from './Materiales'
import { I18nProvider } from '../i18n'

vi.mock('../api', () => ({
  getHealth: async () => ({ ok: true, snapshot: false, parts: 0, pat: false }),
  getFacets: async () => ({ manufacturers: [] }),
  fetchAllParts: async () => [],
  dpCheck: async () => ({}),
  createChange: async () => ({ id: 'x' }),
}))

vi.mock('./QueuesRail', () => ({
  QueuesRail: () => null,
}))

beforeEach(() => localStorage.setItem('byndr.lang', 'es'))

it('sin snapshot ensena el procedimiento de ingesta en vez de una tabla vacia', async () => {
  render(<I18nProvider><Materiales /></I18nProvider>)
  expect(await screen.findByText(/sin snapshot todavía/i)).toBeInTheDocument()
})
