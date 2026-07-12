import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfigGate } from './ConfigGate'

interface FakeRes {
  ok: boolean
  status: number
  statusText?: string
  json: () => Promise<unknown>
}

function stubFetch(res: FakeRes) {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(res)))
}

afterEach(() => vi.unstubAllGlobals())

describe('ConfigGate', () => {
  it('con clave válida llama onConnect con la sesión (base+clave+tenant)', async () => {
    stubFetch({ ok: true, status: 200, json: async () => ({ id: 'tenant-1' }) })
    const onConnect = vi.fn()
    render(<ConfigGate onConnect={onConnect} />)
    fireEvent.change(screen.getByPlaceholderText('x-api-key'), { target: { value: 'k' } })
    fireEvent.click(screen.getByRole('button', { name: 'conectar' }))
    await waitFor(() => expect(onConnect).toHaveBeenCalledTimes(1))
    expect(onConnect.mock.calls[0][0]).toMatchObject({ key: 'k', tenant: 'tenant-1' })
  })

  it('con 401 muestra "clave inválida" y no conecta', async () => {
    stubFetch({ ok: false, status: 401, statusText: 'Unauthorized', json: async () => ({ error: 'bad key' }) })
    const onConnect = vi.fn()
    render(<ConfigGate onConnect={onConnect} />)
    fireEvent.change(screen.getByPlaceholderText('x-api-key'), { target: { value: 'mala' } })
    fireEvent.click(screen.getByRole('button', { name: 'conectar' }))
    expect(await screen.findByText('clave inválida')).toBeInTheDocument()
    expect(onConnect).not.toHaveBeenCalled()
  })
})
