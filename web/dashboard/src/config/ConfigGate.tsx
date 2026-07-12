import { useState, type FormEvent } from 'react'
import { whoami, ApiError } from '../api'
import { DEFAULT_BASE, type Session } from '../session'
import s from './ConfigGate.module.css'

export function ConfigGate({ onConnect }: { onConnect: (session: Session) => void }) {
  const [base, setBase] = useState(DEFAULT_BASE)
  const [key, setKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | undefined>(undefined)

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

  return (
    <div className={s.gate}>
      <form className={s.card} onSubmit={connect}>
        <div className={s.brand}>byndr<i>.</i></div>
        <p className={s.lead}>panel de revisión — conecta con tu clave de tenant</p>

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
      </form>
    </div>
  )
}
