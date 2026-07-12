import { useEffect, useState } from 'react'
import { getHealth, getSettings, setSettings, rotateKey, type Health } from '../api'
import { loadSession, saveSession } from '../session'
import { useT, LangSelect } from '../i18n'
import s from './Ajustes.module.css'

export function Ajustes({ onRotate }: { onRotate?: (key: string) => void }) {
  const t = useT()
  const [health, setHealth] = useState<Health | null>(null)
  const [requireL0, setRequireL0] = useState<boolean | null>(null)
  const [err, setErr] = useState(false)

  // sesión (base + clave + tenant): vive aquí, es donde se revela/rota la clave.
  const session = loadSession()
  const [key, setKey] = useState(session?.key ?? '')
  const [reveal, setReveal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [rotErr, setRotErr] = useState(false)

  useEffect(() => {
    Promise.all([getHealth(), getSettings()])
      .then(([h, st]) => { setHealth(h); setRequireL0(st.require_l0_approval); setErr(false) })
      .catch(() => setErr(true))
  }, [])

  if (err) return <p style={{ padding: 22, color: 'var(--warn)' }}>{t('common.error')}</p>
  if (!health || requireL0 === null) return <p style={{ padding: 22, color: 'var(--dim)' }}>…</p>

  // toggle optimista: cambia ya, y revierte solo si el servidor rechaza el cambio.
  const toggleL0 = async () => {
    const next = !requireL0
    setRequireL0(next)
    try { await setSettings({ require_l0_approval: next }) }
    catch { setRequireL0(!next) }
  }

  const copyKey = () => {
    void navigator.clipboard?.writeText(key).then(() => setCopied(true), () => setCopied(false))
  }

  const rotate = async () => {
    const cur = loadSession()
    if (cur === undefined) return
    setRotating(true); setRotErr(false)
    try {
      const r = await rotateKey()
      const next = { ...cur, key: r.api_key }
      saveSession(next)
      setKey(r.api_key)
      onRotate?.(r.api_key)
    } catch { setRotErr(true) }
    finally { setRotating(false) }
  }

  // aj.mode reutiliza ch.dry/ch.real/ch.unknown (mismo dominio de valores que en Cambios)
  // en vez de duplicar claves de traducción para el mismo significado.
  const mode = health.last_write_dry_run == null ? t('ch.unknown')
    : health.last_write_dry_run ? t('ch.dry') : t('ch.real')

  const masked = key ? key.slice(0, 4) + '·'.repeat(Math.max(key.length - 4, 4)) : ''

  return (
    <div className={s.wrap}>
      <h2>{t('aj.title')}</h2>

      <section className={s.grp}>
        <h3>{t('aj.lang')}</h3>
        <div className={s.row}>
          <span className={s.big}><LangSelect /></span>
        </div>
        <p className={s.note}>{t('aj.langNote')}</p>
      </section>

      {session && (
        <section className={s.grp}>
          <h3>{t('aj.key')}</h3>
          <div className={s.row}>
            <span>{t('aj.tenant')}</span>
            <span className="mono">{session.tenant}</span>
          </div>
          <div className={s.keybox}>
            <code className="mono">{reveal ? key : masked}</code>
            <button type="button" className={s.keyact} onClick={() => setReveal(r => !r)}>
              {reveal ? t('aj.keyHide') : t('aj.keyReveal')}
            </button>
            <button type="button" className={s.keyact} onClick={copyKey}>
              {copied ? t('aj.keyCopied') : t('aj.keyCopy')}
            </button>
          </div>
          <button type="button" className={s.rotate} onClick={rotate} disabled={rotating}>
            {rotating ? t('aj.keyRotating') : t('aj.keyRotate')}
          </button>
          {rotErr && <p className={s.err}>{t('aj.keyRotateErr')}</p>}
          <p className={s.note}>{t('aj.keyNote')}</p>
        </section>
      )}

      <section className={s.grp}>
        <h3>{t('aj.dp')}</h3>
        <div className={s.row}>
          <span>{t('aj.pat')}</span>
          <span className="mono" style={{ color: health.pat ? 'var(--ok)' : 'var(--warn)' }}>
            {health.pat ? t('aj.patOk') : t('aj.patMissing')}
          </span>
        </div>
      </section>

      <section className={s.grp}>
        <h3>{t('aj.write')}</h3>
        <div className={s.row}>
          <span>{t('aj.l0')}</span>
          <button type="button" role="switch" aria-checked={requireL0}
                  className={`${s.sw} ${requireL0 ? s.on : ''}`} onClick={toggleL0}>
            <i />
          </button>
        </div>
        <div className={s.row}>
          <span>{t('aj.mode')}</span>
          <span className="mono">{mode}</span>
        </div>
        <p className={s.note}>{t('aj.erp')}</p>
      </section>

      <section className={s.grp}>
        <h3>{t('aj.data')}</h3>
        <div className={s.row}>
          <span>{t('aj.snapshot')}</span>
          <span className="mono">{t('aj.parts', { n: health.parts })}</span>
        </div>
        <p className={s.note}>{t('aj.reingest')}</p>
      </section>
    </div>
  )
}
