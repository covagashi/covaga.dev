import { render, screen } from '@testing-library/react'
import { Expediente } from './Expediente'
import { I18nProvider } from '../i18n'

vi.mock('../api', () => ({
  fetchAllParts: async () => { throw new Error('network down') },
  createChange: async () => ({ id: 'x' }),
}))

beforeEach(() => localStorage.setItem('byndr.lang', 'es'))

it('un fallo de red muestra reintentar, no el estado no-encontrado', async () => {
  render(<I18nProvider><Expediente pn="X.1" /></I18nProvider>)
  expect(await screen.findByText('no se pudo cargar')).toBeInTheDocument()
  expect(screen.queryByText(/no se encontró/)).not.toBeInTheDocument()
})
