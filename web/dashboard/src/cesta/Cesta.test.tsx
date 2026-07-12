import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Cesta } from './Cesta'
import { I18nProvider } from '../i18n'

// forma real confirmada en simplify_basket (server.py): cada item trae
// id, count, description, part_id, part_number.
const removeBasketItem = vi.fn(async (_id: string) => {})
vi.mock('../api', () => ({
  getBasket: async () => ({
    items: [{ id: '123', count: 1, description: 'contactor 3RT2', part_id: '9', part_number: 'X-100' }],
  }),
  removeBasketItem: (id: string) => removeBasketItem(id),
}))

beforeEach(() => {
  localStorage.setItem('byndr.lang', 'es')
  removeBasketItem.mockClear()
})

it('renderiza el item de la cesta y quitar llama a removeBasketItem con su id', async () => {
  render(<I18nProvider><Cesta /></I18nProvider>)
  expect(await screen.findByText('contactor 3RT2')).toBeInTheDocument()
  fireEvent.click(screen.getByText('quitar'))
  await waitFor(() => expect(removeBasketItem).toHaveBeenCalledWith('123'))
})
