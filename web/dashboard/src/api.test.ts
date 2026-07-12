import { fetchAllParts, createChange } from './api'

function mockFetchSequence(pages: any[]) {
  let call = 0
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true, status: 200, json: async () => pages[Math.min(call++, pages.length - 1)],
  })))
}

describe('api', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('fetchAllParts pagina hasta el total', async () => {
    const mk = (n: number) => ({ part_number: `P${n}`, manufacturer: 'X' })
    mockFetchSequence([
      { total: 5, offset: 0, limit: 2, items: [mk(1), mk(2)] },
      { total: 5, offset: 2, limit: 2, items: [mk(3), mk(4)] },
      { total: 5, offset: 4, limit: 2, items: [mk(5)] },
    ])
    const parts = await fetchAllParts({ missing: 'ul' })
    expect(parts).toHaveLength(5)
    const calls = (fetch as any).mock.calls.map((c: any[]) => String(c[0]))
    expect(calls[0]).toContain('missing=ul')
    expect(calls[0]).toContain('sort=mfr')
    expect(calls[1]).toContain('offset=2')
  })

  it('createChange lanza con el error del servidor', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false, status: 400,
      json: async () => ({ error: 'erp_number es de solo lectura, nunca se edita' }),
    })))
    await expect(createChange('t', 'humano', [
      { part_number: 'X', field: 'erp_number', new: '1' },
    ])).rejects.toThrow(/solo lectura/)
  })
})
