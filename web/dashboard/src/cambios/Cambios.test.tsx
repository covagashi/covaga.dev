import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Cambios } from './Cambios'
import { I18nProvider } from '../i18n'

const approveChange = vi.fn(async (_id: string) => {})
const rejectChange = vi.fn(async (_id: string, _reason?: string) => {})
const applyChanges = vi.fn(async () => ({ queued: [] }))

const CHANGESET = {
  id: 'cs-1', status: 'pending', title: 'propuesta ul contactor', author: 'humano',
  created: '2026-07-10T10:00:00Z', job_id: null, last_result: null,
  items: [{ part_number: 'X-100', variant: '', field: 'ul_value', lang: '', old: '', new: 'E12345' }],
}

vi.mock('../api', () => ({
  getChanges: async (_status?: string) => ({
    items: [CHANGESET],
    counts: { pending: 1, approved: 0, applied: 3, rejected: 0 },
  }),
  getHealth: async () => ({
    ok: true, snapshot: true, parts: 10, pat: true,
    bridge_last_poll: new Date().toISOString(), last_write_dry_run: false, pending_changes: 1,
  }),
  approveChange: (id: string) => approveChange(id),
  rejectChange: (id: string, reason?: string) => rejectChange(id, reason),
  applyChanges: () => applyChanges(),
}))

beforeEach(() => {
  localStorage.setItem('byndr.lang', 'es')
  approveChange.mockClear(); rejectChange.mockClear(); applyChanges.mockClear()
})

it('abre el diff de un changeset y aprobar llama a approveChange con su id', async () => {
  render(<I18nProvider><Cambios /></I18nProvider>)
  expect(await screen.findByText('propuesta ul contactor')).toBeInTheDocument()

  // el diff todavía no está visible
  expect(screen.queryByText('E12345')).not.toBeInTheDocument()

  fireEvent.click(screen.getByText('propuesta ul contactor'))
  expect(await screen.findByText('E12345')).toBeInTheDocument()
  expect(screen.getByText('∅')).toBeInTheDocument() // old vacío

  fireEvent.click(screen.getByText('aprobar'))
  await waitFor(() => expect(approveChange).toHaveBeenCalledWith('cs-1'))
})

it('cancelar el prompt de rechazo no llama a rejectChange', async () => {
  vi.spyOn(window, 'prompt').mockReturnValue(null)
  render(<I18nProvider><Cambios /></I18nProvider>)
  expect(await screen.findByText('propuesta ul contactor')).toBeInTheDocument()

  fireEvent.click(screen.getByText('propuesta ul contactor'))
  expect(await screen.findByText('rechazar')).toBeInTheDocument()

  fireEvent.click(screen.getByText('rechazar'))
  await Promise.resolve()
  expect(rejectChange).not.toHaveBeenCalled()
})
