import { useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { fetchAllParts, dpCheck, createChange, getHealth, getFacets,
         type Part, type QueueFilter } from '../api'
import { buildRows, type Row } from './rows'
import { sortParts, type SortDir } from './sortParts'
import { COLUMN_VIEWS, VIEW_LABELS } from './columns'
import { QueuesRail } from './QueuesRail'
import { RowExpand } from './RowExpand'
import { useSelection } from './useSelection'
import { navigate, useRoute } from '../router'
import { useT, type TKey } from '../i18n'
import s from './Materiales.module.css'

const keyOf = (p: Part) => `${p.part_number}|${p.variant ?? ''}`

const SYS_LABELS: [TKey, QueueFilter][] = [
  ['queue.no_ul', { missing: 'ul' }], ['queue.no_photo', { missing: 'photo' }],
  ['queue.no_ce', { missing: 'ce' }], ['queue.no_erp', { missing: 'erp' }],
  ['queue.no_macro', { missing: 'macro' }], ['queue.no_description', { missing: 'description' }],
]

export function Materiales() {
  const t = useT()
  const route = useRoute()
  const [filter, setFilter] = useState<QueueFilter>({ missing: 'ul' })
  const [label, setLabel] = useState(() => t('queue.no_ul'))
  const [q, setQ] = useState('')
  const [dq, setDq] = useState('')
  const [view, setView] = useState<keyof typeof COLUMN_VIEWS>('general')
  const [parts, setParts] = useState<Part[]>([])
  const [progress, setProgress] = useState<[number, number] | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState('')
  const [noSnapshot, setNoSnapshot] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [reloadTick, setReloadTick] = useState(0)
  const [mfrTotals, setMfrTotals] = useState<Map<string, number>>(new Map())
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [activeIdx, setActiveIdx] = useState(-1)
  const { selected, toggle, clear } = useSelection()
  const generation = useRef(0)
  const busyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // setBusyNow: mensaje de progreso persistente. Cancela cualquier flash pendiente
  // para que su timeout no borre este mensaje a media operacion.
  const setBusyNow = (msg: string) => {
    clearTimeout(busyTimer.current)
    setBusy(msg)
  }

  const flashBusy = (msg: string) => {
    clearTimeout(busyTimer.current)
    setBusy(msg)
    busyTimer.current = setTimeout(() => setBusy(''), 4000)
  }

  useEffect(() => {
    const qf = route.query
    if (!Object.keys(qf).length) return
    setFilter(qf as QueueFilter)
    const sys = SYS_LABELS.find(([, f]) => JSON.stringify(f) === JSON.stringify(qf))
    setLabel(sys ? t(sys[0]) : Object.values(qf).join(' · '))
  }, [JSON.stringify(route.query)])

  useEffect(() => {
    const t = setTimeout(() => setDq(q), 250)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    let alive = true
    getHealth().then(h => { if (alive) setNoSnapshot(!h.snapshot) }).catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    let alive = true
    getFacets({}).then(r => {
      if (alive) setMfrTotals(new Map(r.manufacturers.map(m => [m.name, m.count])))
    }).catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!noSnapshot) return
    const iv = setInterval(() => {
      getHealth().then(h => { if (h.snapshot) setNoSnapshot(false) }).catch(() => {})
    }, 4000)
    return () => clearInterval(iv)
  }, [noSnapshot])

  useEffect(() => {
    generation.current++
    let alive = true
    setParts([]); setProgress([0, 0]); setExpanded(null); setLoadError(false); clear()
    fetchAllParts({ ...filter, q: dq || undefined },
      (l, t) => { if (!alive) throw new Error('stale'); setProgress([l, t]) })
      .then(p => { if (alive) { setParts(p); setProgress(null) } })
      .catch(e => { if (alive && e?.message !== 'stale') { setProgress(null); setLoadError(true) } })
    return () => { alive = false }
  }, [filter, dq, clear, noSnapshot, reloadTick])

  useEffect(() => () => clearTimeout(busyTimer.current), [])

  // Teclado: la fila activa deja de tener sentido al cambiar el conjunto visible.
  useEffect(() => { setActiveIdx(-1) }, [filter, dq, sortKey, sortDir])

  const cols = COLUMN_VIEWS[view]

  // sortKey !== null → lista plana ordenada por esa columna, sin cabeceras de grupo.
  // sortKey === null → agrupado por fabricante (buildRows), orden de llegada del snapshot.
  const sortedParts = useMemo(() => {
    if (!sortKey) return parts
    const col = cols.find(c => c.key === sortKey)
    return col ? sortParts(parts, col.value, sortDir) : parts
  }, [parts, cols, sortKey, sortDir])

  const rows = useMemo(() => {
    const out: Row[] = []
    if (sortKey) {
      for (const part of sortedParts) {
        out.push({ type: 'part', part })
        if (keyOf(part) === expanded) out.push({ type: 'expand', part })
      }
    } else {
      for (const r of buildRows(sortedParts)) {
        out.push(r)
        if (r.type === 'part' && keyOf(r.part) === expanded) out.push({ type: 'expand', part: r.part })
      }
    }
    return out
  }, [sortedParts, expanded, sortKey])

  // Indices de `rows` que son filas de tipo part, en orden — la navegacion por
  // teclado mueve un indice sobre este subconjunto (activeIdx), no sobre `rows`.
  const partRowIndices = useMemo(
    () => rows.reduce<number[]>((acc, r, i) => { if (r.type === 'part') acc.push(i); return acc }, []),
    [rows],
  )
  const activeRowIndex = activeIdx >= 0 && activeIdx < partRowIndices.length ? partRowIndices[activeIdx] : -1

  const cycleSort = (key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); return }
    if (sortDir === 'asc') { setSortDir('desc'); return }
    setSortKey(null); setSortDir('asc')
  }

  const scrollRef = useRef<HTMLDivElement>(null)
  const virtual = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: i => rows[i].type === 'group' ? 28 : rows[i].type === 'expand' ? 118 : 32,
    overscan: 20,
  })

  // Navegacion por teclado (spec §3): el contenedor scrolleable es focusable;
  // ↑/↓ mueven la fila activa (solo filas tipo part), espacio marca/desmarca,
  // → expande/colapsa, ↵ abre el expediente.
  const moveActive = (delta: number) => {
    if (!partRowIndices.length) return
    setActiveIdx(prev => {
      const base = prev < 0 ? (delta > 0 ? -1 : partRowIndices.length) : prev
      const next = Math.min(Math.max(base + delta, 0), partRowIndices.length - 1)
      virtual.scrollToIndex(partRowIndices[next])
      return next
    })
  }

  const onKeyDownContainer = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); return }
    if (activeRowIndex < 0) return
    const active = rows[activeRowIndex] as { type: 'part'; part: Part }
    if (e.key === ' ') { e.preventDefault(); toggle(keyOf(active.part)); return }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const k = keyOf(active.part)
      setExpanded(prev => prev === k ? null : k)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      navigate(`#/materiales/${encodeURIComponent(active.part.part_number)}`)
    }
  }

  const proposeUl = async (targets: Part[]) => {
    const val = window.prompt(t('ul.prompt', { n: targets.length }))
    if (!val) return
    setBusyNow(t('busy.creating'))
    try {
      await createChange(`UL ${val} · ${targets.length} artículos`, 'humano',
        targets.map(p => ({ part_number: p.part_number, variant: p.variant, field: 'ul_value', new: val })))
      flashBusy(t('busy.created'))
    } catch (e: any) { flashBusy(t('busy.error', { msg: e.message })) }
  }

  const checkDp = async () => {
    const gen = generation.current
    const pns = parts.filter(p => selected.has(keyOf(p))).map(p => p.part_number)
    setBusyNow(t('busy.checking', { done: 0, total: pns.length }))
    let failed = 0
    for (let i = 0; i < pns.length; i += 100) {
      await dpCheck(pns.slice(i, i + 100)).catch(() => { failed++ })
      setBusyNow(t('busy.checking', { done: Math.min(i + 100, pns.length), total: pns.length }))
    }
    try {
      const fresh = await fetchAllParts({ ...filter, q: q || undefined })
      if (gen === generation.current) setParts(fresh)
    } catch { /* la recarga fallida no debe ocultar el resultado del check */ }
    flashBusy(failed === 0 ? t('busy.checked', { n: pns.length }) : t('busy.checkErrors', { n: failed }))
  }

  const selParts = parts.filter(p => selected.has(keyOf(p)))

  if (noSnapshot) return (
    <div style={{ padding: 40, maxWidth: 560, lineHeight: 1.8 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t('nosnap.title')}</h2>
      <ol style={{ color: 'var(--mut)', paddingLeft: 18, display: 'grid', gap: 8 }}>
        <li>{t('nosnap.step1')}</li>
        <li className="mono">{t('nosnap.step2')}</li>
        <li>{t('nosnap.step3')}</li>
      </ol>
    </div>
  )

  return (
    <div className={s.wrap}>
      <QueuesRail active={filter} onSelect={(l, f) => { setLabel(l); setFilter(f) }} />
      <div className={s.main}>
        <div className={s.ctx}>
          <span className={s.title}>{label}
            <small>{t('mat.subtitle', { n: parts.length.toLocaleString('es') })}</small></span>
          <input id="buscador" className={s.search} placeholder={t('mat.search')}
                 value={q} onChange={e => setQ(e.target.value)} />
          <div className={s.seg} role="tablist">
            {VIEW_LABELS.map(([id, l]) => (
              <button key={id} role="tab" aria-selected={view === id}
                      className={view === id ? s.on : ''} onClick={() => setView(id)}>{t(l)}</button>
            ))}
          </div>
        </div>
        <div className={s.scroll} ref={scrollRef} tabIndex={0} onKeyDown={onKeyDownContainer}>
          <div className={s.hrow}>
            <span className={`${s.hcell} ${s.check}`}></span>
            {cols.map(c => (
              <button key={c.key} type="button" className={s.hcell}
                      aria-sort={sortKey === c.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                      style={c.width ? { width: c.width } : { flex: 1 }}
                      onClick={() => cycleSort(c.key)}>
                {t(c.label)}
                {sortKey === c.key && <span className={s.ac}>{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>}
              </button>
            ))}
          </div>
          {loadError && (
            <div style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--warn)' }}>{t('common.error')}</span>
              <button className={s.btn} onClick={() => setReloadTick(x => x + 1)}>{t('common.retry')}</button>
            </div>
          )}
          {!loadError && !progress && parts.length === 0 && (
            <p style={{ padding: 22, color: 'var(--dim)' }}>{t('mat.clean')}</p>
          )}
          <div style={{ height: virtual.getTotalSize(), position: 'relative' }}>
            {virtual.getVirtualItems().map(vi => {
              const row = rows[vi.index]
              const style: React.CSSProperties = {
                position: 'absolute', top: 0, left: 0, width: '100%',
                transform: `translateY(${vi.start}px)`,
              }
              if (row.type === 'group') {
                const total = mfrTotals.get(row.manufacturer)
                const pct = total ? Math.round((row.count / total) * 100) : 0
                return (
                  <div key={vi.key} data-index={vi.index} ref={virtual.measureElement} className={s.grow} style={style}>
                    <b>{row.manufacturer}</b>· {total
                      ? t('mat.groupPct', { n: row.count.toLocaleString('es'), pct, total: total.toLocaleString('es') })
                      : t('mat.group', { n: row.count.toLocaleString('es') })}
                  </div>
                )
              }
              if (row.type === 'expand') return (
                <div key={vi.key} data-index={vi.index} ref={virtual.measureElement} style={style}>
                  <RowExpand part={row.part} onPropose={p => proposeUl([p])} />
                </div>
              )
              const p: Part = row.part
              const k = keyOf(p)
              return (
                <div key={vi.key} data-index={vi.index} ref={virtual.measureElement} style={style}
                     className={`${s.prow} ${selected.has(k) ? s.sel : ''} ${vi.index === activeRowIndex ? s.kb : ''}`}
                     onClick={() => setExpanded(expanded === k ? null : k)}>
                  <span className={`${s.cell} ${s.check}`}
                        onClick={e => { e.stopPropagation(); toggle(k) }}>
                    {selected.has(k) ? '☑' : '☐'}
                  </span>
                  {cols.map(c => {
                    const missing = c.missing?.(p)
                    const raw = c.value(p)
                    const v = c.translateValue && raw ? t(raw as TKey) : raw
                    return (
                      <span key={c.key}
                            className={`${s.cell} ${c.key === 'part_number' ? s.pn : ''}`}
                            style={c.width ? { width: c.width } : { flex: 1 }}>
                        {missing ? <span className={s.miss}>∅</span>
                          : v || <span className={s.na}>—</span>}
                      </span>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
        {selected.size > 0 && (
          <div className={s.selbar}>
            <span><b>{t('sel.count', { n: selected.size })}</b></span>
            <button className={s.btn} onClick={checkDp}>{t('sel.checkDp')}</button>
            <button className={`${s.btn} ${s.g}`} onClick={() => proposeUl(selParts)}>{t('sel.proposeUl')}</button>
            <button className={`${s.btn} ${s.g}`} onClick={clear}>{t('sel.clear')}</button>
          </div>
        )}
        <div className={s.sbar}>
          <span>{progress ? t('mat.loading', { l: progress[0].toLocaleString('es'), t: progress[1].toLocaleString('es') })
            : t('mat.count', { n: parts.length.toLocaleString('es') })}</span>
          {busy && <span style={{ color: 'var(--ac)' }}>{busy}</span>}
          <span style={{ marginLeft: 'auto' }} className="mono">{t('mat.hint')}</span>
        </div>
      </div>
    </div>
  )
}
