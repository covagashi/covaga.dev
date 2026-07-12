import { render, screen, fireEvent } from '@testing-library/react'
import { QueuesRail } from './QueuesRail'
import { I18nProvider } from '../i18n'

const onSelect = vi.fn()
vi.mock('../api', () => ({
  getQueues: async () => ({
    system: [
      { id: 'all', label: 'todo', count: 4, filter: {} },
      { id: 'no_ul', label: 'sin ul', count: 2, filter: { missing: 'ul' } },
    ],
    saved: [{ id: 'x1', label: 'mi cola', count: 1, filter: { mfr: 'siemens' } }],
  }),
  getFacets: async () => ({ manufacturers: [{ name: 'Siemens', count: 2 }] }),
  createQueue: async () => ({ id: 'nuevo' }),
  deleteQueue: async () => {},
}))

beforeEach(() => localStorage.setItem('byndr.lang', 'es'))

it('pinta colas y notifica la seleccion', async () => {
  render(<I18nProvider><QueuesRail active={{}} onSelect={onSelect} /></I18nProvider>)
  fireEvent.click(await screen.findByText('sin ul'))
  expect(onSelect).toHaveBeenCalledWith('sin ul', { missing: 'ul' })
  expect(await screen.findByText('mi cola')).toBeInTheDocument()
  expect(await screen.findByText('Siemens')).toBeInTheDocument()
})

it('el borrar de una cola guardada es un boton real y no selecciona la cola', async () => {
  render(<I18nProvider><QueuesRail active={{}} onSelect={onSelect} /></I18nProvider>)
  const del = await screen.findByRole('button', { name: 'borrar mi cola' })
  expect(del.tagName).toBe('BUTTON')
  fireEvent.click(del)
  expect(onSelect).not.toHaveBeenCalledWith('mi cola', { mfr: 'siemens' })
})
