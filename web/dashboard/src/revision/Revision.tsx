import { useCallback, useEffect, useState } from 'react'
import {
  getProposals, approveProposals, rejectProposals,
  ApiError, type Proposal, type ProposalStatus,
} from '../api'
import type { Session } from '../session'
import { confidencePct, confidenceLevel, toggle, shown } from '../lib'
import s from './Revision.module.css'

const TABS: { status: ProposalStatus; label: string }[] = [
  { status: 'validated', label: 'pendientes' },
  { status: 'approved', label: 'aprobados' },
  { status: 'applied', label: 'aplicados' },
  { status: 'rejected', label: 'rechazados' },
]

const EMPTY_COUNTS: Record<ProposalStatus, number> = {
  validated: 0, approved: 0, applied: 0, rejected: 0,
}

export function Revision({ session }: { session: Session }) {
  const [tab, setTab] = useState<ProposalStatus>('validated')
  const [items, setItems] = useState<Proposal[]>([])
  const [counts, setCounts] = useState<Record<ProposalStatus, number>>(EMPTY_COUNTS)
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | undefined>(undefined)

  const load = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const results = await Promise.all(TABS.map(t => getProposals(session, t.status)))
      const next = { ...EMPTY_COUNTS }
      TABS.forEach((t, i) => { next[t.status] = results[i].proposals.length })
      setCounts(next)
      const idx = TABS.findIndex(t => t.status === tab)
      setItems(results[idx].proposals)
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? 'clave inválida' : 'error al cargar')
    } finally {
      setLoading(false)
    }
  }, [session, tab])

  useEffect(() => { load() }, [load])
  useEffect(() => { setSelected(new Set()) }, [tab])

  const act = async (kind: 'approve' | 'reject') => {
    const ids = [...selected]
    if (ids.length === 0) return
    setBusy(true)
    setMsg(undefined)
    try {
      if (kind === 'approve') await approveProposals(session, ids)
      else await rejectProposals(session, ids)
      setSelected(new Set())
      await load()
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'error en la operación')
    } finally {
      setBusy(false)
    }
  }

  const reviewable = tab === 'validated'

  return (
    <div className={s.wrap}>
      <div className={s.head}>
        <h2 className={s.title}>revisión de propuestas</h2>
        <span className={s.sub}>
          {counts.validated} pendientes · {counts.applied} aplicadas
        </span>
        <button className={s.reload} onClick={() => load()} disabled={loading}>
          {loading ? 'cargando…' : 'recargar'}
        </button>
      </div>

      <div className={s.tabs}>
        {TABS.map(t => (
          <button key={t.status} className={tab === t.status ? s.on : ''} onClick={() => setTab(t.status)}>
            {t.label} <span className={s.n}>{counts[t.status]}</span>
          </button>
        ))}
      </div>

      <div className={s.scroll}>
        {error !== undefined && <p className={s.state} style={{ color: 'var(--warn)' }}>{error}</p>}
        {error === undefined && !loading && items.length === 0 && (
          <p className={s.state}>no hay propuestas en este estado</p>
        )}
        {error === undefined && items.map(p => {
          const on = selected.has(p.id)
          return (
            <article key={p.id} className={`${s.card} ${on ? s.cardOn : ''}`}>
              <div className={s.l1}>
                {reviewable && (
                  <input
                    type="checkbox"
                    className={s.check}
                    checked={on}
                    aria-label={`seleccionar ${p.part_number}`}
                    onChange={() => setSelected(prev => toggle(prev, p.id))}
                  />
                )}
                <span className={`mono ${s.pn}`}>{p.part_number}</span>
                {p.variant !== '' && <span className={`mono ${s.variant}`}>{p.variant}</span>}
                <span className={s.task}>{p.task_type}</span>
                {p.lang !== '' && <span className={s.chip}>{p.lang}</span>}
                <span className={`mono ${s.conf} ${s[confidenceLevel(p.confidence)]}`}>
                  {confidencePct(p.confidence)}
                </span>
              </div>
              <div className={s.diff}>
                <div className={s.dr}>
                  <span className={s.fk}>{p.field}{p.lang !== '' ? ` · ${p.lang}` : ''}</span>
                  <span className={s.old}>{shown(p.old_value)}</span>
                  <span className={s.new}>{shown(p.new_value)}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {reviewable && selected.size > 0 && (
        <div className={s.selbar}>
          <span>seleccionadas <b>{selected.size}</b></span>
          <button className={s.link} onClick={() => setSelected(new Set())}>limpiar</button>
          <button className={s.btn} disabled={busy} onClick={() => act('approve')}>
            aprobar ({selected.size})
          </button>
          <button className={`${s.btn} ${s.g}`} disabled={busy} onClick={() => act('reject')}>
            rechazar ({selected.size})
          </button>
        </div>
      )}

      {msg !== undefined && <p className={s.toast}>{msg}</p>}
    </div>
  )
}
