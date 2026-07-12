import { render, screen } from '@testing-library/react'
import { Masthead } from './Masthead'
import { I18nProvider } from '../i18n'

vi.mock('../api', () => ({
  getHealth: async () => ({ ok: true, snapshot: true, parts: 4, pat: false }),
  getChanges: async () => ({ items: [], counts: { pending: 12 } }),
}))

// jsdom reporta navigator.language = 'en-US'; forzamos 'es' para que el test
// (que asume copy en español) sea determinista, ver Global Constraints del plan.
beforeEach(() => localStorage.setItem('byndr.lang', 'es'))

it('pinta las 6 secciones y el contador de cambios', async () => {
  window.location.hash = '#/cambios'
  render(<I18nProvider><Masthead /></I18nProvider>)
  for (const l of ['Materiales', 'Estadísticas', 'Cesta', 'Cambios', 'Gym', 'Ajustes'])
    expect(screen.getByText(l)).toBeInTheDocument()
  expect(await screen.findByText('12')).toBeInTheDocument()
  expect(screen.getByText('Cambios').closest('a')).toHaveAttribute('aria-current', 'page')
})
