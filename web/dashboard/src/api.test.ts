import { describe, it, expect, vi, afterEach } from 'vitest'
import { whoami, approveProposals, rejectProposals, getProposals, ApiError } from './api'
import type { Session } from './session'

const session: Session = { base: 'https://api.example.dev', key: 'secret', tenant: 't1' }

interface FakeRes {
  ok: boolean
  status: number
  statusText?: string
  json: () => Promise<unknown>
}

function stubFetch(res: FakeRes) {
  const fn = vi.fn((..._args: [string, RequestInit]) => Promise.resolve(res))
  vi.stubGlobal('fetch', fn)
  return fn
}

function firstCall(fn: ReturnType<typeof stubFetch>): [string, RequestInit] {
  return fn.mock.calls[0] as [string, RequestInit]
}

afterEach(() => vi.unstubAllGlobals())

describe('api client', () => {
  it('whoami pega en /whoami con la cabecera X-Api-Key y sin barra final duplicada', async () => {
    const fn = stubFetch({ ok: true, status: 200, json: async () => ({ id: 'tenant-1' }) })
    const who = await whoami('https://api.example.dev/', 'secret')
    expect(who.id).toBe('tenant-1')
    const [url, init] = firstCall(fn)
    expect(url).toBe('https://api.example.dev/whoami')
    const headers = init.headers as Record<string, string>
    expect(headers['X-Api-Key']).toBe('secret')
  })

  it('getProposals añade el status como query param', async () => {
    const fn = stubFetch({ ok: true, status: 200, json: async () => ({ proposals: [] }) })
    await getProposals(session, 'validated')
    const [url] = firstCall(fn)
    expect(url).toBe('https://api.example.dev/api/gym/proposals?status=validated')
  })

  it('approveProposals hace POST con los ids en el cuerpo json', async () => {
    const fn = stubFetch({ ok: true, status: 200, json: async () => ({ ok: true, job_id: 'j1', count: 2 }) })
    const r = await approveProposals(session, ['a', 'b'])
    expect(r.job_id).toBe('j1')
    const [url, init] = firstCall(fn)
    expect(url).toBe('https://api.example.dev/api/gym/proposals/approve')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ ids: ['a', 'b'] })
  })

  it('rejectProposals hace POST a la ruta de rechazo', async () => {
    const fn = stubFetch({ ok: true, status: 200, json: async () => ({ ok: true, count: 1 }) })
    await rejectProposals(session, ['x'])
    const [url, init] = firstCall(fn)
    expect(url).toBe('https://api.example.dev/api/gym/proposals/reject')
    expect(init.method).toBe('POST')
  })

  it('lanza ApiError con el status en respuestas no-2xx', async () => {
    stubFetch({ ok: false, status: 401, statusText: 'Unauthorized', json: async () => ({ error: 'bad key' }) })
    await expect(whoami('https://api.example.dev', 'nope')).rejects.toBeInstanceOf(ApiError)
    stubFetch({ ok: false, status: 401, statusText: 'Unauthorized', json: async () => ({ error: 'bad key' }) })
    await expect(whoami('https://api.example.dev', 'nope')).rejects.toMatchObject({ status: 401, message: 'bad key' })
  })
})
