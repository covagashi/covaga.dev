import { useState } from 'react'
import { loadSession, saveSession, clearSession, type Session } from './session'
import { ConfigGate } from './config/ConfigGate'
import { Revision } from './revision/Revision'
import { Cola } from './cola/Cola'
import s from './App.module.css'

type Tab = 'revision' | 'cola'

const TABS: { id: Tab; label: string }[] = [
  { id: 'revision', label: 'revisión' },
  { id: 'cola', label: 'cola de escritura' },
]

export function App() {
  const [session, setSession] = useState<Session | undefined>(() => loadSession())
  const [tab, setTab] = useState<Tab>('revision')

  if (session === undefined) {
    return (
      <ConfigGate
        onConnect={next => {
          saveSession(next)
          setSession(next)
        }}
      />
    )
  }

  const exit = () => {
    clearSession()
    setSession(undefined)
  }

  return (
    <div className={s.app}>
      <header className={s.mast}>
        <span className={s.wm}>byndr<i>.</i></span>
        <nav className={s.nav} aria-label="secciones">
          {TABS.map(t => (
            <button
              key={t.id}
              className={t.id === tab ? s.on : ''}
              aria-current={t.id === tab ? 'page' : undefined}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className={s.end}>
          <span className={s.tenant} title="tenant conectado">
            <i />
            <span className="mono">{session.tenant}</span>
          </span>
          <button className={s.exit} onClick={exit}>salir</button>
        </div>
      </header>
      {tab === 'revision' ? <Revision session={session} /> : <Cola session={session} />}
    </div>
  )
}
