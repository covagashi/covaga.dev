import { useCallback, useEffect, useState } from 'react'
import { getJobs, ApiError, type WriteJob } from '../api'
import type { Session } from '../session'
import { shortTime } from '../lib'
import s from './Cola.module.css'

function jobClass(status: string): string {
  if (status === 'done' || status === 'applied') return s.done
  if (status === 'taken' || status === 'running') return s.taken
  if (status === 'pending') return s.pending
  return s.other
}

export function Cola({ session }: { session: Session }) {
  const [jobs, setJobs] = useState<WriteJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  const load = useCallback(async () => {
    setError(undefined)
    try {
      const res = await getJobs(session)
      setJobs(res.jobs)
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? 'clave inválida' : 'error al cargar')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    load()
    const iv = setInterval(load, 8000)
    return () => clearInterval(iv)
  }, [load])

  return (
    <div className={s.wrap}>
      <div className={s.head}>
        <h2 className={s.title}>cola de escritura</h2>
        <span className={s.sub}>lo que el bridge aplicará a la base</span>
        <button className={s.reload} onClick={() => load()}>recargar</button>
      </div>

      <div className={s.scroll}>
        {error !== undefined && <p className={s.state} style={{ color: 'var(--warn)' }}>{error}</p>}
        {error === undefined && !loading && jobs.length === 0 && (
          <p className={s.state}>no hay trabajos en cola</p>
        )}
        {error === undefined && jobs.length > 0 && (
          <div className={s.table}>
            <div className={s.hrow}>
              <span className={s.hc}>job</span>
              <span className={s.hc}>estado</span>
              <span className={s.hc}>origen</span>
              <span className={`${s.hc} ${s.right}`}>cambios</span>
              <span className={`${s.hc} ${s.right}`}>creado</span>
            </div>
            {jobs.map(j => (
              <div key={j.id} className={s.row}>
                <span className={`mono ${s.jid}`}>{j.id}</span>
                <span className={`${s.badge} ${jobClass(j.status)}`}>{j.status}</span>
                <span className={s.src}>{j.source}</span>
                <span className={`mono ${s.num}`}>{j.changes}</span>
                <span className={`mono ${s.when}`}>{shortTime(j.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
