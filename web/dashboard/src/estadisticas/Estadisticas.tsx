import { useEffect, useState } from 'react'
import { getMatrix, getStats, getChanges } from '../api'
import { navigate } from '../router'
import { useT, type TKey } from '../i18n'
import s from './Estadisticas.module.css'

const DELIVER_TO_MISSING: Record<string, string> = {
  photo: 'photo', ul: 'ul', ce: 'ce', erp: 'erp', macro: 'macro', description: 'description',
}
const shade = (pct: number) => pct <= 5 ? s.c0 : pct <= 25 ? s.c1 : pct <= 50 ? s.c2 : pct <= 70 ? s.c3 : s.c4

export function Estadisticas() {
  const t = useT()
  const [matrix, setMatrix] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([getMatrix(), getStats(), getChanges()])
      .then(([m, st, ch]) => { setMatrix(m); setStats(st); setCounts(ch.counts) })
      .catch(() => setError(true))
  }, [])

  if (error) return <p style={{ padding: 22, color: 'var(--warn)' }}>{t('common.error')}</p>
  if (!matrix || !stats) return <p style={{ padding: 22, color: 'var(--dim)' }}>…</p>

  const open = (missing: string, mfr?: string) =>
    navigate(`#/materiales?missing=${missing}${mfr ? `&mfr=${encodeURIComponent(mfr.toLowerCase())}` : ''}`)
  const Cell = ({ row, k }: { row: any; k: string }) => {
    const pct = row.total ? Math.round(100 * row.missing[k] / row.total) : 0
    return <td><button className={`${s.cell} ${shade(pct)}`}
      onClick={() => open(DELIVER_TO_MISSING[k], row.manufacturer)}>{pct}%</button></td>
  }

  const raw = t('st.lead')
  const vars: Record<string, string | number> = {
    total: stats.total.toLocaleString('es'), mfrs: stats.manufacturer_count,
    applied: counts['applied'] ?? 0, pending: counts['pending'] ?? 0,
  }

  return (
    <div className={s.wrap}>
      <p className={s.lead}>
        {raw.split(/(\{\w+\})/g).map((part, i) => {
          const m = part.match(/^\{(\w+)\}$/)
          return m ? <b key={i}>{vars[m[1]]}</b> : part
        })}
      </p>
      <div className={s.cols}>
        <div className={s.mtx}>
          <div className={s.cap}>{t('st.matrix')}<small>{t('st.matrixHint')}</small></div>
          <table>
            <thead><tr><th></th>{matrix.deliverables.map((d: string) =>
              <th key={d}>{t(('d.' + d) as TKey)}</th>)}</tr></thead>
            <tbody>
              {matrix.rows.map((r: any) => (
                <tr key={r.manufacturer}>
                  <td><b>{r.manufacturer}</b><span className={s.n}>{r.total.toLocaleString('es')} refs</span></td>
                  {matrix.deliverables.map((d: string) => <Cell key={d} row={r} k={d} />)}
                </tr>
              ))}
              {matrix.rest && (
                <tr><td><b>{t('st.rest', { n: matrix.rest.manufacturers })}</b>
                  <span className={s.n}>{matrix.rest.total.toLocaleString('es')} refs</span></td>
                  {matrix.deliverables.map((d: string) => <Cell key={d} row={matrix.rest} k={d} />)}</tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={s.aside}>
          <div>
            <div className={s.cap}>{t('st.coverage')}</div>
            {matrix.deliverables.map((d: string) => {
              const have = stats.coverage[d === 'description' ? 'description' : d] ?? 0
              const pct = stats.total ? Math.round(100 * have / stats.total) : 0
              return (
                <button key={d} className={s.cov} onClick={() => open(DELIVER_TO_MISSING[d])}>
                  <span className={s.k}>{t(('d.' + d) as TKey)}</span>
                  <span className={s.tr}><i style={{ width: `${pct}%` }} /></span>
                  <span className={s.n}><b>{pct}%</b> · {t('st.of', { n: (stats.total - have).toLocaleString('es') })}</span>
                </button>
              )
            })}
          </div>
          <div className={s.card}>
            <div className={s.row}><span className={s.cap} style={{ margin: 0 }}>{t('st.changes')}</span>
              <span className={s.big}>{counts['applied'] ?? 0}<small>{t('st.applied')}</small></span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--mut)' }}>
              <span>{counts['pending'] ?? 0} {t('st.pendingShort')}</span>
              <a href="#/cambios" style={{ color: 'var(--ac)' }}>{t('st.see')}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
