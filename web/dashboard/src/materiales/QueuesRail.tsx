import { useCallback, useEffect, useState } from 'react'
import { getQueues, getFacets, createQueue, deleteQueue,
         type Queue, type QueueFilter } from '../api'
import { useT, type TKey } from '../i18n'
import { es } from '../i18n/dicts'
import s from './QueuesRail.module.css'

const same = (a: QueueFilter, b: QueueFilter) => JSON.stringify(a) === JSON.stringify(b)

const sysKey = (id: string): TKey | null => {
  const k = `queue.${id}`
  return Object.prototype.hasOwnProperty.call(es, k) ? (k as TKey) : null
}

export function QueuesRail({ active, onSelect }: {
  active: QueueFilter
  onSelect: (label: string, f: QueueFilter) => void
}) {
  const t = useT()
  const [system, setSystem] = useState<Queue[]>([])
  const [saved, setSaved] = useState<Queue[]>([])
  const [facets, setFacets] = useState<{ name: string; count: number }[]>([])

  const reload = useCallback(() => {
    getQueues().then(r => { setSystem(r.system); setSaved(r.saved) }).catch(() => {})
  }, [])
  useEffect(reload, [reload])
  useEffect(() => {
    getFacets(active).then(r => setFacets(r.manufacturers.slice(0, 8))).catch(() => {})
  }, [active])

  const QueueBtn = ({ q, del }: { q: Queue; del?: boolean }) => {
    const key = sysKey(q.id)
    const display = key ? t(key) : q.label
    return (
      <div className={`${s.q} ${same(q.filter, active) ? s.on : ''}`}>
        <button className={s.qbtn} onClick={() => onSelect(display, q.filter)}>
          {display}
        </button>
        {del && (
          <button className={s.del} aria-label={t('rail.delete', { label: q.label })}
                  onClick={async () => { await deleteQueue(q.id); reload() }}>✕</button>
        )}
        <span className={s.n}>{q.count.toLocaleString('es')}</span>
      </div>
    )
  }

  return (
    <aside className={s.rail} aria-label={t('rail.title')}>
      <div className={s.cap}>{t('rail.title')}</div>
      {system.map(q => <QueueBtn key={q.id} q={q} />)}
      {saved.map(q => <QueueBtn key={q.id} q={q} del />)}
      <button className={`${s.q} ${s.qbtn} ${s.new}`} onClick={async () => {
        const label = window.prompt(t('rail.newPrompt'))
        if (label) { await createQueue(label, active); reload() }
      }}>{t('rail.new')}</button>
      <div className={s.facet}>
        <div className={s.cap}>{t('rail.mfr')}</div>
        {facets.map(f => (
          <button key={f.name} className={`${s.q} ${s.qbtn}`}
                  onClick={() => onSelect(f.name, { ...active, mfr: f.name.toLowerCase() })}>
            {f.name}<span className={s.n}>{f.count.toLocaleString('es')}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
