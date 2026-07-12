import { render, screen, fireEvent } from '@testing-library/react'
import { Materiales } from './Materiales'
import { I18nProvider } from '../i18n'
import type { Part } from '../api'

// jsdom no reporta tamaños de layout (getBoundingClientRect/ResizeObserver), asi
// que @tanstack/react-virtual calcula un rango visible vacio y no pinta ninguna
// fila real (verificado: con el virtualizer real, getVirtualItems() devuelve []
// en este entorno aunque getTotalSize() sea correcto). Para poder ejercitar la
// navegacion por teclado del componente real (no una reimplementacion aparte),
// se sustituye aqui el virtualizador por uno que expone todas las filas —
// mismo contrato (getTotalSize/getVirtualItems/measureElement/scrollToIndex),
// sin windowing. La logica bajo prueba (activeIdx, seleccion, expand, enter)
// sigue siendo la de Materiales.tsx.
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (opts: { count: number; estimateSize: (i: number) => number }) => {
    let top = 0
    const items = Array.from({ length: opts.count }, (_, index) => {
      const start = top
      top += opts.estimateSize(index)
      return { key: index, index, start }
    })
    return {
      getTotalSize: () => top,
      getVirtualItems: () => items,
      measureElement: () => {},
      scrollToIndex: () => {},
    }
  },
}))

const part = (pn: string, mfr: string): Part => ({
  part_number: pn, variant: '', manufacturer: mfr,
  order_number: '', description: `descr ${pn}`, description_i18n: {},
  product_group: '', has_photo: true, photo_path: '', has_macro: true, macro_path: '',
  has_erp: true, erp_number: '', has_ce: true, ce_value: '',
  has_ul: true, ul_value: '', has_description: true,
  is_discontinued: false, last_change: '', dp: null,
} as Part)

vi.mock('../api', () => ({
  getHealth: async () => ({ ok: true, snapshot: true, parts: 2, pat: false }),
  getFacets: async () => ({ manufacturers: [{ name: 'ABB', count: 20 }] }),
  fetchAllParts: async () => [part('A1', 'ABB'), part('A2', 'ABB')],
  dpCheck: async () => ({}),
  createChange: async () => ({ id: 'x' }),
}))

vi.mock('./QueuesRail', () => ({ QueuesRail: () => null }))

beforeEach(() => {
  localStorage.setItem('byndr.lang', 'es')
  window.location.hash = ''
})

it('ArrowDown mueve la fila activa y espacio marca/desmarca la seleccion', async () => {
  const { container } = render(<I18nProvider><Materiales /></I18nProvider>)
  await screen.findByText(/descr A1/)
  const scrollEl = container.querySelector('[tabindex="0"]') as HTMLElement
  expect(scrollEl).toBeTruthy()

  fireEvent.keyDown(scrollEl, { key: 'ArrowDown' })
  fireEvent.keyDown(scrollEl, { key: ' ' })
  expect(await screen.findByText('1 seleccionados')).toBeInTheDocument()

  fireEvent.keyDown(scrollEl, { key: ' ' })
  expect(screen.queryByText('1 seleccionados')).not.toBeInTheDocument()
})

it('ArrowRight expande la fila activa y ↵ navega al expediente', async () => {
  const { container } = render(<I18nProvider><Materiales /></I18nProvider>)
  await screen.findByText(/descr A1/)
  const scrollEl = container.querySelector('[tabindex="0"]') as HTMLElement

  fireEvent.keyDown(scrollEl, { key: 'ArrowDown' })
  fireEvent.keyDown(scrollEl, { key: 'ArrowRight' })
  expect(await screen.findByText('expediente ↗')).toBeInTheDocument()

  fireEvent.keyDown(scrollEl, { key: 'ArrowRight' })
  expect(screen.queryByText('expediente ↗')).not.toBeInTheDocument()

  fireEvent.keyDown(scrollEl, { key: 'Enter' })
  expect(window.location.hash).toBe('#/materiales/A1')
})

it('la cabecera de grupo muestra el % sobre el total del fabricante (getFacets)', async () => {
  render(<I18nProvider><Materiales /></I18nProvider>)
  // ABB: 2 en esta cola, 20 en total -> 10%
  expect(await screen.findByText(/2 en esta cola · 10% de 20 refs/)).toBeInTheDocument()
})

it('clic en cabecera de columna ordena asc → desc → null y quita/pone grupos', async () => {
  render(<I18nProvider><Materiales /></I18nProvider>)
  await screen.findByText(/descr A1/)
  const header = screen.getByRole('button', { name: /part number/ })

  expect(await screen.findByText(/2 en esta cola · 10% de 20 refs/)).toBeInTheDocument()

  fireEvent.click(header)
  expect(header).toHaveAttribute('aria-sort', 'ascending')
  expect(screen.queryByText(/2 en esta cola · 10% de 20 refs/)).not.toBeInTheDocument()

  fireEvent.click(header)
  expect(header).toHaveAttribute('aria-sort', 'descending')

  fireEvent.click(header)
  expect(header).not.toHaveAttribute('aria-sort')
  expect(await screen.findByText(/2 en esta cola · 10% de 20 refs/)).toBeInTheDocument()
})
