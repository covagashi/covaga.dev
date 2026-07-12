import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Ajustes } from './Ajustes'
import { I18nProvider } from '../i18n'

const getHealth = vi.fn()
const getSettings = vi.fn()
const setSettings = vi.fn(async (_s: { require_l0_approval: boolean }) => {})
vi.mock('../api', () => ({
  getHealth: () => getHealth(),
  getSettings: () => getSettings(),
  setSettings: (s: any) => setSettings(s),
}))

beforeEach(() => {
  localStorage.setItem('byndr.lang', 'es')
  getHealth.mockReset()
  getSettings.mockReset()
  setSettings.mockReset()
  setSettings.mockResolvedValue(undefined)
})

it('sin pat configurado: muestra el aviso "no configurado" en vez de "válido"', async () => {
  getHealth.mockResolvedValue({ ok: true, snapshot: true, parts: 120, pat: false, last_write_dry_run: true })
  getSettings.mockResolvedValue({ require_l0_approval: false })
  render(<I18nProvider><Ajustes /></I18nProvider>)
  expect(await screen.findByText(/no configurado/)).toBeInTheDocument()
  expect(screen.queryByText(/válido/)).not.toBeInTheDocument()
})

it('con pat configurado: muestra "válido"', async () => {
  getHealth.mockResolvedValue({ ok: true, snapshot: true, parts: 120, pat: true, last_write_dry_run: false })
  getSettings.mockResolvedValue({ require_l0_approval: false })
  render(<I18nProvider><Ajustes /></I18nProvider>)
  expect(await screen.findByText(/válido/)).toBeInTheDocument()
})

it('click en el switch l0: llama a setSettings con el valor invertido (optimista)', async () => {
  getHealth.mockResolvedValue({ ok: true, snapshot: true, parts: 120, pat: true, last_write_dry_run: false })
  getSettings.mockResolvedValue({ require_l0_approval: false })
  render(<I18nProvider><Ajustes /></I18nProvider>)
  const sw = await screen.findByRole('switch')
  expect(sw).toHaveAttribute('aria-checked', 'false')
  fireEvent.click(sw)
  expect(sw).toHaveAttribute('aria-checked', 'true') // optimista: ya cambió antes de que resuelva la promesa
  await waitFor(() => expect(setSettings).toHaveBeenCalledWith({ require_l0_approval: true }))
})

it('si setSettings falla: el switch revierte al valor anterior', async () => {
  getHealth.mockResolvedValue({ ok: true, snapshot: true, parts: 120, pat: true, last_write_dry_run: false })
  getSettings.mockResolvedValue({ require_l0_approval: false })
  setSettings.mockRejectedValue(new Error('boom'))
  render(<I18nProvider><Ajustes /></I18nProvider>)
  const sw = await screen.findByRole('switch')
  fireEvent.click(sw)
  await waitFor(() => expect(sw).toHaveAttribute('aria-checked', 'false'))
})

it('error al cargar health/settings: muestra common.error', async () => {
  getHealth.mockRejectedValue(new Error('net'))
  getSettings.mockResolvedValue({ require_l0_approval: false })
  render(<I18nProvider><Ajustes /></I18nProvider>)
  expect(await screen.findByText('no se pudo cargar')).toBeInTheDocument()
})
