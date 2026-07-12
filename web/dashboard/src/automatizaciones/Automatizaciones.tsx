import { useEffect, useState, type FormEvent } from 'react'
import {
  getDestinations, createDestination, getRoutes, createRoute, getExecutions,
  type Destination, type AutomationRoute, type Execution,
} from '../api'
import { useT, type TKey } from '../i18n'
import s from './Automatizaciones.module.css'

// eventos soportados por byndr-dev (ids estables del backend) + su clave i18n.
const EVENTS: { id: string; label: TKey }[] = [
  { id: 'pdf-exported', label: 'au.evPdf' },
  { id: 'bom-exported', label: 'au.evBom' },
  { id: 'project-closed', label: 'au.evClosed' },
  { id: 'bom-changed', label: 'au.evBomChanged' },
]
const KINDS = ['webhook', 'email', 'slack']

export function Automatizaciones() {
  const t = useT()
  const [dests, setDests] = useState<Destination[]>([])
  const [routes, setRoutes] = useState<AutomationRoute[]>([])
  const [execs, setExecs] = useState<Execution[]>([])
  const [ready, setReady] = useState(false)

  // nuevo destino
  const [dName, setDName] = useState('')
  const [dKind, setDKind] = useState('webhook')
  const [dUrl, setDUrl] = useState('')
  const [dBusy, setDBusy] = useState(false)

  // nueva ruta
  const [rEvent, setREvent] = useState(EVENTS[0].id)
  const [rDest, setRDest] = useState('')
  const [rBusy, setRBusy] = useState(false)

  // cada lista degrada por separado: si el backend aún no tiene el endpoint,
  // esa sección queda vacía en vez de romper la pantalla.
  const load = async () => {
    const [d, r, x] = await Promise.all([
      getDestinations().then(v => v.destinations ?? []).catch(() => [] as Destination[]),
      getRoutes().then(v => v.routes ?? []).catch(() => [] as AutomationRoute[]),
      getExecutions().then(v => v.executions ?? []).catch(() => [] as Execution[]),
    ])
    setDests(d); setRoutes(r); setExecs(x)
    if (rDest === '' && d.length > 0) setRDest(d[0].id)
    setReady(true)
  }
  useEffect(() => { void load() }, [])

  const addDest = async (e: FormEvent) => {
    e.preventDefault()
    if (dName.trim() === '' || dUrl.trim() === '') return
    setDBusy(true)
    try {
      await createDestination({ name: dName.trim(), kind: dKind, url: dUrl.trim() })
      setDName(''); setDUrl('')
      await load()
    } catch { /* el backend puede no soportarlo aún: se ignora sin romper */ }
    finally { setDBusy(false) }
  }

  const addRoute = async (e: FormEvent) => {
    e.preventDefault()
    if (rDest === '') return
    setRBusy(true)
    try {
      await createRoute({ event: rEvent, destination_id: rDest })
      await load()
    } catch { /* idem */ }
    finally { setRBusy(false) }
  }

  const evLabel = (id: string) => {
    const e = EVENTS.find(v => v.id === id)
    return e ? t(e.label) : id
  }
  const destName = (id: string) => dests.find(d => d.id === id)?.name ?? id

  if (!ready) return <p className={s.state} style={{ padding: 22 }}>{t('au.loading')}</p>

  return (
    <div className={s.wrap}>
      <h2>{t('au.title')}</h2>
      <p className={s.lead}>{t('au.lead')}</p>

      <section className={s.grp}>
        <h3>{t('au.destinations')}</h3>
        <div className={s.table}>
          <div className={`${s.hrow} ${s.dcols}`}>
            <span className={s.hc}>{t('au.name')}</span>
            <span className={s.hc}>{t('au.type')}</span>
            <span className={s.hc}>{t('au.url')}</span>
          </div>
          {dests.length === 0 && <div className={s.state}>{t('au.emptyDest')}</div>}
          {dests.map(d => (
            <div key={d.id} className={`${s.row} ${s.dcols}`}>
              <span>{d.name}</span>
              <span className={`${s.badge}`}>{d.kind}</span>
              <span className={s.dim}>{d.url}</span>
            </div>
          ))}
        </div>
        <form className={s.form} onSubmit={addDest}>
          <input className={s.in} value={dName} onChange={e => setDName(e.target.value)}
                 placeholder={t('au.name')} spellCheck={false} />
          <select className={s.sel} value={dKind} onChange={e => setDKind(e.target.value)}>
            {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <input className={s.in} value={dUrl} onChange={e => setDUrl(e.target.value)}
                 placeholder={t('au.url')} spellCheck={false} autoComplete="off" />
          <button className={s.add} type="submit" disabled={dBusy}>
            {dBusy ? t('au.adding') : t('au.newDestination')}
          </button>
        </form>
      </section>

      <section className={s.grp}>
        <h3>{t('au.routes')}</h3>
        <div className={s.table}>
          <div className={`${s.hrow} ${s.rcols}`}>
            <span className={s.hc}>{t('au.event')}</span>
            <span className={s.hc}>{t('au.destination')}</span>
          </div>
          {routes.length === 0 && <div className={s.state}>{t('au.emptyRoutes')}</div>}
          {routes.map(r => (
            <div key={r.id} className={`${s.row} ${s.rcols}`}>
              <span>{evLabel(r.event)}</span>
              <span className={s.mut}>{r.destination ?? destName(r.destination_id)}</span>
            </div>
          ))}
        </div>
        <form className={s.form} onSubmit={addRoute}>
          <select className={s.sel} value={rEvent} onChange={e => setREvent(e.target.value)}>
            {EVENTS.map(ev => <option key={ev.id} value={ev.id}>{t(ev.label)}</option>)}
          </select>
          <select className={s.sel} value={rDest} onChange={e => setRDest(e.target.value)}>
            {dests.length === 0 && <option value="">—</option>}
            {dests.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button className={s.add} type="submit" disabled={rBusy || dests.length === 0}>
            {rBusy ? t('au.adding') : t('au.newRoute')}
          </button>
        </form>
      </section>

      <section className={s.grp}>
        <h3>{t('au.executions')}</h3>
        <div className={s.table}>
          <div className={`${s.hrow} ${s.xcols}`}>
            <span className={s.hc}>{t('au.event')}</span>
            <span className={s.hc}>{t('au.destination')}</span>
            <span className={s.hc}>{t('au.status')}</span>
            <span className={s.hc}>{t('au.when')}</span>
          </div>
          {execs.length === 0 && <div className={s.state}>{t('au.emptyExec')}</div>}
          {execs.map(x => (
            <div key={x.id} className={`${s.row} ${s.xcols}`}>
              <span>{evLabel(x.event)}</span>
              <span className={s.mut}>{x.destination}</span>
              <span className={`${s.badge} ${x.status === 'ok' ? s.ok : s.err}`}>{x.status}</span>
              <span className={s.when}>{x.at}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
