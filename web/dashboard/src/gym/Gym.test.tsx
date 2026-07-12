import { render, screen } from '@testing-library/react'
import { Gym } from './Gym'
import { I18nProvider } from '../i18n'

const getGymStatus = vi.fn()
vi.mock('../api', () => ({
  getGymStatus: () => getGymStatus(),
}))

beforeEach(() => {
  localStorage.setItem('byndr.lang', 'es')
  getGymStatus.mockReset()
})

it('sin datos: muestra los tres párrafos de enseñanza (con el comando cli en .mono)', async () => {
  getGymStatus.mockResolvedValue({ available: false, episodes: [], proposals: {} })
  render(<I18nProvider><Gym /></I18nProvider>)
  expect(await screen.findByText(/el gym es un entorno headless/)).toBeInTheDocument()
  expect(screen.getByText(/nunca escribe la base/)).toBeInTheDocument()
  expect(screen.getByText(/todavía no hay episodios/)).toBeInTheDocument()
  const cmd = screen.getByText('python -m gym.runner --tasks translate --limit 50')
  expect(cmd.className).toBe('mono')
})

it('con episodios: la tabla muestra el % de éxito por episodio y los conteos de propuestas', async () => {
  getGymStatus.mockResolvedValue({
    available: true,
    episodes: [
      { episode: 1, task: 'translate', done: 10, ok: 8 },
      { episode: 2, task: 'translate', done: 5, ok: 5 },
    ],
    proposals: { validated: 1, pending: 2 },
  })
  render(<I18nProvider><Gym /></I18nProvider>)
  expect(await screen.findByText('80%')).toBeInTheDocument()
  expect(screen.getByText('100%')).toBeInTheDocument()
  expect(screen.getByText('validated: 1')).toBeInTheDocument()
  expect(screen.getByText('pending: 2')).toBeInTheDocument()
})
