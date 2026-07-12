import { useEffect, useState, type FormEvent } from 'react'
import { whoami, getPlans, signup, ApiError } from '../api'
import { DEFAULT_BASE, type Session } from '../session'
import { useT } from '../i18n'
import s from './ConfigGate.module.css'

type Mode = 'crear' | 'clave'

export function ConfigGate({ onConnect }: { onConnect: (session: Session) => void }) {
  const t = useT()
  const [mode, setMode] = useState<Mode>('crear')
  const [base, setBase] = useState(DEFAULT_BASE)

  // modo "ya tengo una clave"
  const [key, setKey] = useState('')

  // modo "crear cuenta"
  const [email, setEmail] = useState('')
  const [plans, setPlans] = useState<string[]>([])
  const [plan, setPlan] = useState('free')

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // el worker está oculto por defecto (plataforma alojada); solo se muestra
  // para quien se autohospede.
  const [advanced, setAdvanced] = useState(false)

  // carga los planes al entrar en el modo alta (una vez que hay base).
  useEffect(() => {
    if (mode !== 'crear') return
    let live = true
    getPlans(base.trim())
      .then(r => {
        if (!live) return
        const list = Array.isArray(r.plans) ? r.plans : []
        setPlans(list)
        if (list.length > 0 && !list.includes(plan)) setPlan(list[0])
      })
      .catch(() => {
        // sin planes del worker: dejamos el default "free" utilizable.
      })
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, base])

  const switchMode = (next: Mode) => { setMode(next); setErr('') }

  const connect = async (e: FormEvent) => {
    e.preventDefault()
    const b = base.trim()
    const k = key.trim()
    if (b === '' || k === '') { setErr(t('gate.errMissing')); return }
    setBusy(true); setErr('')
    try {
      const who = await whoami(b, k)
      onConnect({ base: b, key: k, tenant: who.id })
    } catch (e2) {
      if (e2 instanceof ApiError && e2.status === 401) setErr(t('gate.errKey'))
      else setErr(t('gate.errConnect'))
    } finally { setBusy(false) }
  }

  // crear cuenta: tras el alta se entra directo (la clave se gestiona en ajustes,
  // no se muestra en un muro).
  const create = async (e: FormEvent) => {
    e.preventDefault()
    const b = base.trim()
    const em = email.trim()
    if (b === '' || em === '') { setErr(t('gate.errMissing')); return }
    setBusy(true); setErr('')
    try {
      const r = await signup(b, em, plan)
      onConnect({ base: b, key: r.api_key, tenant: r.tenant_id })
    } catch (e2) {
      if (e2 instanceof ApiError && e2.status === 409) setErr(t('gate.errTaken'))
      else if (e2 instanceof ApiError && e2.status === 400) setErr(t('gate.errInvalid'))
      else setErr(t('gate.errCreate'))
    } finally { setBusy(false) }
  }

  return (
    <div className={s.gate}>
      <form className={s.card} onSubmit={mode === 'crear' ? create : connect}>
        <div className={s.brand}>byndr<i>.</i></div>
        <p className={s.lead}>{t('gate.lead')}</p>

        <div className={s.modes} role="tablist" aria-label={t('gate.lead')}>
          <button type="button" role="tab" aria-selected={mode === 'crear'}
                  className={mode === 'crear' ? s.modeOn : ''} onClick={() => switchMode('crear')}>
            {t('gate.modeCreate')}
          </button>
          <button type="button" role="tab" aria-selected={mode === 'clave'}
                  className={mode === 'clave' ? s.modeOn : ''} onClick={() => switchMode('clave')}>
            {t('gate.modeKey')}
          </button>
        </div>

        {advanced && (
          <label className={s.field}>
            <span className={s.cap}>{t('gate.worker')}</span>
            <input className={`mono ${s.input}`} value={base}
                   onChange={e => setBase(e.target.value)} spellCheck={false} autoComplete="off" />
          </label>
        )}

        {mode === 'crear' ? (
          <>
            <label className={s.field}>
              <span className={s.cap}>{t('gate.email')}</span>
              <input className={s.input} type="email" value={email}
                     onChange={e => setEmail(e.target.value)} placeholder={t('gate.emailPh')}
                     spellCheck={false} autoComplete="off" />
            </label>

            <div className={s.field}>
              <span className={s.cap}>{t('gate.plan')}</span>
              <div className={s.plans} role="group" aria-label={t('gate.plan')}>
                {(plans.length > 0 ? plans : ['free']).map(p => (
                  <button key={p} type="button" aria-pressed={p === plan}
                          className={p === plan ? s.planOn : ''} onClick={() => setPlan(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {err !== '' && <p className={s.err}>{err}</p>}

            <button className={s.btn} type="submit" disabled={busy}>
              {busy ? t('gate.creating') : t('gate.create')}
            </button>
          </>
        ) : (
          <>
            <label className={s.field}>
              <span className={s.cap}>{t('gate.apiKey')}</span>
              <input className={`mono ${s.input}`} type="password" value={key}
                     onChange={e => setKey(e.target.value)} placeholder={t('gate.apiKeyPh')}
                     spellCheck={false} autoComplete="off" />
            </label>

            {err !== '' && <p className={s.err}>{err}</p>}

            <button className={s.btn} type="submit" disabled={busy}>
              {busy ? t('gate.connecting') : t('gate.connect')}
            </button>
          </>
        )}

        <button type="button" className={s.selfhost} onClick={() => setAdvanced(a => !a)}>
          {advanced ? t('gate.selfhostHide') : t('gate.selfhostShow')}
        </button>
      </form>
    </div>
  )
}
