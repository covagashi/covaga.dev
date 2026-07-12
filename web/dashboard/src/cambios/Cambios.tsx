import { useEffect, useState } from 'react'
import { getChanges, approveChange, rejectChange, applyChanges, getHealth,
         type Changeset, type Health } from '../api'
import { useT } from '../i18n'
import s from './Cambios.module.css'

const STATUSES = ['pending', 'approved', 'applied', 'rejected'] as const
const SKEY = { pending: 'ch.pending', approved: 'ch.approved', applied: 'ch.applied', rejected: 'ch.rejected' } as const

export function Cambios() {
  const t = useT()
  const [status, setStatus] = useState<string>('pending')
  const [items, setItems] = useState<Changeset[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [health, setHealth] = useState<Health | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [err, setErr] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => Promise.all([getChanges(status), getHealth()])
    .then(([ch, h]) => { setItems(ch.items); setCounts(ch.counts); setHealth(h); setErr(false) })
    .catch(() => setErr(true))
  useEffect(() => { load(); const iv = setInterval(load, 8000); return () => clearInterval(iv) }, [status])

  const bridgeActive = !!health?.bridge_last_poll &&
    Date.now() - new Date(health.bridge_last_poll).getTime() < 15_000

  if (err) return <p style={{ padding: 22, color: 'var(--warn)' }}>{t('common.error')}</p>

  return (
    <div className={s.wrap}>
      <div className={s.lst}>
        <div className={s.head}><h2>{t('ch.title')}</h2>
          <span>{t('ch.sub', { p: counts['pending'] ?? 0, a: counts['applied'] ?? 0 })}</span></div>
        <div className={s.tabs}>
          {STATUSES.map(st => (
            <button key={st} className={status === st ? s.on : ''} onClick={() => setStatus(st)}>
              {t(SKEY[st])} {counts[st] ?? 0}</button>
          ))}
        </div>
        {items.length === 0 && <p className={s.empty}>{t('ch.empty')}</p>}
        {items.map(cs => (
          <div key={cs.id} className={`${s.cs} ${open === cs.id ? s.open : ''}`}>
            <button className={s.l1} onClick={() => setOpen(open === cs.id ? null : cs.id)}>
              <span className={`mono ${s.id}`}>#{cs.id}</span>
              <span className={s.ti}>{cs.title}</span>
              <span className={`${s.who} ${cs.author !== 'humano' ? s.ia : ''}`}>
                {cs.author === 'humano' ? t('ch.you') : cs.author}</span>
              <span className={`mono ${s.st}`}>{cs.status}</span>
            </button>
            {open === cs.id && (
              <>
                <div className={s.diff}>
                  {cs.items.map((it, i) => (
                    <div key={i} className={s.dr}>
                      <span className={s.fk}>{it.part_number}<br />{it.field}{it.lang ? ` · ${it.lang}` : ''}</span>
                      <span className={s.old}>{it.old === '' ? '∅' : it.old}</span>
                      <span className={s.new}>{it.new === '' ? '∅' : it.new}</span>
                    </div>
                  ))}
                </div>
                {cs.status === 'pending' && (
                  <div className={s.acts}>
                    <button className={s.btn} onClick={async () => {
                      setMsg('')
                      try { await approveChange(cs.id) } catch (e: any) { setMsg(t('busy.error', { msg: e.message })) }
                      load()
                    }}>{t('ch.approve')}</button>
                    <button className={`${s.btn} ${s.g}`} onClick={async () => {
                      setMsg('')
                      const reason = window.prompt(t('ch.rejectPrompt'))
                      if (reason === null) return
                      try { await rejectChange(cs.id, reason) } catch (e: any) { setMsg(t('busy.error', { msg: e.message })) }
                      load()
                    }}>{t('ch.reject')}</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <aside className={s.aside}>
        <div className={s.cap}>{t('ch.queue')}</div>
        <div className={s.qrow}><span>{t('ch.waiting')}</span><span className="mono">{counts['approved'] ?? 0}</span></div>
        <div className={s.qrow}><span>{t('ch.bridge')}</span>
          <span className="mono" style={{ color: bridgeActive ? 'var(--ok)' : 'var(--dim)' }}>
            {bridgeActive ? t('ch.active') : t('ch.inactive')}</span></div>
        <div className={s.qrow}><span>{t('ch.mode')}</span>
          <span className="mono" style={{ color: health?.last_write_dry_run ? 'var(--warn)' : 'var(--tx)' }}>
            {health?.last_write_dry_run == null ? t('ch.unknown')
              : health.last_write_dry_run ? t('ch.dry') : t('ch.real')}</span></div>
        <button className={s.btn} disabled={!counts['approved']}
                onClick={async () => {
                  setMsg('')
                  try { await applyChanges() } catch (e: any) { setMsg(t('busy.error', { msg: e.message })) }
                  load()
                }}>
          {t('ch.apply', { n: counts['approved'] ?? 0 })}</button>
        <p className={s.note}>{t('ch.note')}</p>
        {msg && <p className={s.note} style={{ color: 'var(--err)' }}>{msg}</p>}
      </aside>
    </div>
  )
}
