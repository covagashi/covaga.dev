import { useEffect, useState, type FormEvent } from 'react'
import { whoami, getPlans, signup, ApiError } from '../api'
import { DEFAULT_BASE, type Session } from '../session'
import s from './ConfigGate.module.css'

type Mode = 'crear' | 'clave'

export function ConfigGate({ onConnect }: { onConnect: (session: Session) => void }) {
  const [mode, setMode] = useState<Mode>('crear')
  const [base, setBase] = useState(DEFAULT_BASE)

  // modo "ya tengo una clave"
  const [key, setKey] = useState('')

  // modo "crear cuenta"
  const [email, setEmail] = useState('')
  const [plans, setPlans] = useState<string[]>([])
  const [plan, setPlan] = useState('free')

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | undefined>(undefined)

  // sesión que espera confirmación tras mostrar la clave una única vez.
  const [pending, setPending] = useState<Session | undefined>(undefined)
  const [copied, setCopied] = useState(false)

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
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, base])

  const switchMode = (next: Mode) => {
    setMode(next)
    setErr(undefined)
  }

  const connect = async (e: FormEvent) => {
    e.preventDefault()
    const b = base.trim()
    const k = key.trim()
    if (b === '' || k === '') {
      setErr('faltan datos')
      return
    }
    setBusy(true)
    setErr(undefined)
    try {
      const who = await whoami(b, k)
      onConnect({ base: b, key: k, tenant: who.id })
    } catch (e2) {
      if (e2 instanceof ApiError && e2.status === 401) setErr('clave inválida')
      else setErr('no se pudo conectar')
    } finally {
      setBusy(false)
    }
  }

  const create = async (e: FormEvent) => {
    e.preventDefault()
    const b = base.trim()
    const em = email.trim()
    if (b === '' || em === '') {
      setErr('faltan datos')
      return
    }
    setBusy(true)
    setErr(undefined)
    try {
      const r = await signup(b, em, plan)
      setPending({ base: b, key: r.api_key, tenant: r.tenant_id })
    } catch (e2) {
      if (e2 instanceof ApiError && e2.status === 409) setErr('ese email ya tiene cuenta')
      else if (e2 instanceof ApiError && e2.status === 400) setErr('email o plan no válido')
      else setErr('no se pudo crear la cuenta')
    } finally {
      setBusy(false)
    }
  }

  const copy = () => {
    if (pending === undefined) return
    void navigator.clipboard?.writeText(pending.key).then(
      () => setCopied(true),
      () => setCopied(false),
    )
  }

  // clave recién creada: se muestra una única vez antes de entrar.
  if (pending !== undefined) {
    return (
      <div className={s.gate}>
        <div className={s.card}>
          <div className={s.brand}>byndr<i>.</i></div>
          <p className={s.lead}>cuenta creada — esta es tu clave</p>

          <div className={s.field}>
            <span className={s.cap}>clave api</span>
            <div className={s.keybox}>
              <code className="mono">{pending.key}</code>
              <button type="button" className={s.copy} onClick={copy}>
                {copied ? 'copiada' : 'copiar'}
              </button>
            </div>
          </div>

          <p className={s.warn}>guárdala — no se vuelve a mostrar</p>

          <button className={s.btn} type="button" onClick={() => onConnect(pending)}>
            continuar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={s.gate}>
      <form className={s.card} onSubmit={mode === 'crear' ? create : connect}>
        <div className={s.brand}>byndr<i>.</i></div>
        <p className={s.lead}>panel de revisión</p>

        <div className={s.modes} role="tablist" aria-label="acceso">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'crear'}
            className={mode === 'crear' ? s.modeOn : ''}
            onClick={() => switchMode('crear')}
          >
            crear cuenta
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'clave'}
            className={mode === 'clave' ? s.modeOn : ''}
            onClick={() => switchMode('clave')}
          >
            ya tengo una clave
          </button>
        </div>

        <label className={s.field}>
          <span className={s.cap}>worker</span>
          <input
            className={`mono ${s.input}`}
            value={base}
            onChange={e => setBase(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </label>

        {mode === 'crear' ? (
          <>
            <label className={s.field}>
              <span className={s.cap}>email</span>
              <input
                className={s.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                spellCheck={false}
                autoComplete="off"
              />
            </label>

            <div className={s.field}>
              <span className={s.cap}>plan</span>
              <div className={s.plans} role="group" aria-label="plan">
                {(plans.length > 0 ? plans : ['free']).map(p => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={p === plan}
                    className={p === plan ? s.planOn : ''}
                    onClick={() => setPlan(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {err !== undefined && <p className={s.err}>{err}</p>}

            <button className={s.btn} type="submit" disabled={busy}>
              {busy ? 'creando…' : 'crear cuenta'}
            </button>
          </>
        ) : (
          <>
            <label className={s.field}>
              <span className={s.cap}>clave api</span>
              <input
                className={`mono ${s.input}`}
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="x-api-key"
                spellCheck={false}
                autoComplete="off"
              />
            </label>

            {err !== undefined && <p className={s.err}>{err}</p>}

            <button className={s.btn} type="submit" disabled={busy}>
              {busy ? 'conectando…' : 'conectar'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
