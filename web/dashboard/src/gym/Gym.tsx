import { useEffect, useState } from 'react'
import { getGymStatus } from '../api'
import { useT } from '../i18n'
import s from './Gym.module.css'

type Episode = { episode: number; task: string; done: number; ok: number }
type GymStatus = { available: boolean; episodes: Episode[]; proposals: Record<string, number> }

const rate = (ep: Episode) => (ep.done ? Math.round((100 * ep.ok) / ep.done) : 0)

export function Gym() {
  const t = useT()
  const [status, setStatus] = useState<GymStatus | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getGymStatus().then(setStatus).catch(() => setError(true))
  }, [])

  if (error) return <p style={{ padding: 22, color: 'var(--warn)' }}>{t('common.error')}</p>
  if (!status) return <p style={{ padding: 22, color: 'var(--dim)' }}>…</p>

  if (!status.available) {
    return (
      <div className={s.wrap}>
        <div className={s.teach}>
          <div className={s.cap}>{t('gym.title')}</div>
          <p>{t('gym.teach1')}</p>
          <p>{t('gym.teach2')}</p>
          <p>{t('gym.teach3')} <span className="mono">{t('gym.teach3cmd')}</span></p>
        </div>
      </div>
    )
  }

  const episodes = status.episodes
  const proposals = status.proposals
  const n = episodes.length
  const points = episodes.map((ep, i) => {
    const x = n > 1 ? (i / (n - 1)) * 220 : 110
    const y = 46 - (rate(ep) / 100) * 44 - 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <div className={s.wrap}>
      <div className={s.card}>
        <div className={s.cap}>
          {t('gym.episodes')}
          {n > 0 && (
            <svg viewBox="0 0 220 46" className={s.curve} preserveAspectRatio="none">
              <polyline points={points} fill="none" stroke="var(--ac)" strokeWidth={2} />
            </svg>
          )}
        </div>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th>{t('gym.ep')}</th><th>{t('gym.task')}</th><th>{t('gym.done')}</th>
              <th>{t('gym.ok')}</th><th>{t('gym.rate')}</th>
            </tr>
          </thead>
          <tbody>
            {episodes.map(ep => (
              <tr key={ep.episode}>
                <td className="mono">{ep.episode}</td>
                <td>{ep.task}</td>
                <td>{ep.done}</td>
                <td>{ep.ok}</td>
                <td>{rate(ep)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={s.card}>
        <div className={s.cap}>{t('gym.proposals')}</div>
        <div className={s.props}>
          {Object.keys(proposals).length === 0 && <span className={s.empty}>—</span>}
          {Object.entries(proposals).map(([k, cnt]) => (
            <div key={k} className={s.prop}>{`${k}: ${cnt}`}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
