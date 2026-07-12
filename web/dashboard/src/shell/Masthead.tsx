import { useEffect, useState } from 'react'
import { getHealth, getChanges, type Health } from '../api'
import { useRoute, SECTIONS } from '../router'
import { useT, LangSelect, type TKey } from '../i18n'
import type { Session } from '../session'
import s from './Masthead.module.css'

export function Masthead({ session, onExit }: { session?: Session; onExit?: () => void }) {
  const t = useT()
  const { section } = useRoute()
  const [health, setHealth] = useState<Health | null>(null)
  const [pending, setPending] = useState(0)

  useEffect(() => {
    let alive = true
    const tick = async () => {
      try {
        const [h, ch] = await Promise.all([getHealth(), getChanges()])
        if (!alive) return
        setHealth(h)
        setPending(ch.counts['pending'] ?? 0)
      } catch { if (alive) setHealth(null) }
    }
    tick()
    const timer = setInterval(tick, 10_000)
    return () => { alive = false; clearInterval(timer) }
  }, [])

  return (
    <header className={s.mast}>
      <span className={s.wm}>byndr<i>.</i></span>
      <nav className={s.nav} aria-label={t('nav.aria')}>
        {SECTIONS.map(id => (
          <a key={id} href={`#/${id}`} className={id === section ? s.on : ''}
             aria-current={id === section ? 'page' : undefined}>
            {t(('nav.' + id) as TKey)}
            {id === 'cambios' && pending > 0 && <sup>{pending}</sup>}
          </a>
        ))}
      </nav>
      <div className={s.end}>
        <span className={`${s.sig} ${health?.snapshot ? '' : s.off}`}>
          <i />{t('sig.snapshot')}
        </span>
        <span className={`${s.sig} ${health?.pat ? '' : s.off}`}><i />{t('sig.dataportal')}</span>
        <span className={`${s.sig} ${s.warn}`}><i />{t('sig.dryrun')}</span>
        <LangSelect />
        {session && (
          <span className={s.tenant} title={t('app.tenantTitle')}>
            <i /><span className="mono">{session.tenant}</span>
          </span>
        )}
        {onExit && <button className={s.exit} onClick={onExit}>{t('app.exit')}</button>}
      </div>
    </header>
  )
}
