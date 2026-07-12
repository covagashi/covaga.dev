import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfigGate } from './ConfigGate'

interface FakeRes {
  ok: boolean
  status: number
  statusText?: string
  json: () => Promise<unknown>
}

// enruta el fetch por fragmento de url para poder simular varios endpoints a la vez.
function routeFetch(routes: { match: string; res: FakeRes }[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      const hit = routes.find(r => url.includes(r.match))
      if (hit === undefined) return Promise.reject(new Error(`sin ruta: ${url}`))
      return Promise.resolve(hit.res)
    }),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('ConfigGate — crear cuenta', () => {
  it('camino feliz: carga planes, crea cuenta y muestra la clave una vez', async () => {
    routeFetch([
      { match: '/api/plans', res: { ok: true, status: 200, json: async () => ({ plans: ['free', 'pro'] }) } },
      {
        match: '/api/signup',
        res: { ok: true, status: 200, json: async () => ({ ok: true, tenant_id: 'ten-9', api_key: 'AK-SECRET-123' }) },
      },
    ])
    const onConnect = vi.fn()
    render(<ConfigGate onConnect={onConnect} />)

    // el plan "pro" aparece tras cargar los planes del worker.
    expect(await screen.findByRole('button', { name: 'pro' })).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'a@b.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'crear cuenta' }))

    // la clave se muestra una única vez en la caja destacada.
    expect(await screen.findByText('AK-SECRET-123')).toBeInTheDocument()
    expect(screen.getByText('guárdala — no se vuelve a mostrar')).toBeInTheDocument()
    expect(onConnect).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'continuar' }))
    await waitFor(() => expect(onConnect).toHaveBeenCalledTimes(1))
    expect(onConnect.mock.calls[0][0]).toMatchObject({ key: 'AK-SECRET-123', tenant: 'ten-9' })
  })

  it('con 409 muestra "ese email ya tiene cuenta" y no conecta', async () => {
    routeFetch([
      { match: '/api/plans', res: { ok: true, status: 200, json: async () => ({ plans: ['free'] }) } },
      { match: '/api/signup', res: { ok: false, status: 409, json: async () => ({ error: 'email_taken' }) } },
    ])
    const onConnect = vi.fn()
    render(<ConfigGate onConnect={onConnect} />)
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'a@b.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'crear cuenta' }))
    expect(await screen.findByText('ese email ya tiene cuenta')).toBeInTheDocument()
    expect(onConnect).not.toHaveBeenCalled()
  })
})

describe('ConfigGate — ya tengo una clave', () => {
  it('con clave válida llama onConnect con la sesión (base+clave+tenant)', async () => {
    routeFetch([
      { match: '/api/plans', res: { ok: true, status: 200, json: async () => ({ plans: ['free'] }) } },
      { match: '/whoami', res: { ok: true, status: 200, json: async () => ({ id: 'tenant-1' }) } },
    ])
    const onConnect = vi.fn()
    render(<ConfigGate onConnect={onConnect} />)
    fireEvent.click(screen.getByRole('tab', { name: 'ya tengo una clave' }))
    fireEvent.change(screen.getByPlaceholderText('x-api-key'), { target: { value: 'k' } })
    fireEvent.click(screen.getByRole('button', { name: 'conectar' }))
    await waitFor(() => expect(onConnect).toHaveBeenCalledTimes(1))
    expect(onConnect.mock.calls[0][0]).toMatchObject({ key: 'k', tenant: 'tenant-1' })
  })

  it('con 401 muestra "clave inválida" y no conecta', async () => {
    routeFetch([
      { match: '/api/plans', res: { ok: true, status: 200, json: async () => ({ plans: ['free'] }) } },
      { match: '/whoami', res: { ok: false, status: 401, statusText: 'Unauthorized', json: async () => ({ error: 'bad key' }) } },
    ])
    const onConnect = vi.fn()
    render(<ConfigGate onConnect={onConnect} />)
    fireEvent.click(screen.getByRole('tab', { name: 'ya tengo una clave' }))
    fireEvent.change(screen.getByPlaceholderText('x-api-key'), { target: { value: 'mala' } })
    fireEvent.click(screen.getByRole('button', { name: 'conectar' }))
    expect(await screen.findByText('clave inválida')).toBeInTheDocument()
    expect(onConnect).not.toHaveBeenCalled()
  })
})
