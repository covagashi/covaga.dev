import { render, screen } from '@testing-library/react'
import { Expediente } from './Expediente'
import { I18nProvider } from '../i18n'

vi.mock('../api', () => ({
  fetchAllParts: async () => [],
  createChange: async () => ({ id: 'x' }),
}))

beforeEach(() => localStorage.setItem('byndr.lang', 'es'))

it('pn inexistente muestra estado no-encontrado, no cargando eterno', async () => {
  render(<I18nProvider><Expediente pn="NO.EXISTE" /></I18nProvider>)
  expect(await screen.findByText(/no se encontró/)).toBeInTheDocument()
})
