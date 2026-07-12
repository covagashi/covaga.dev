import { useEffect, useState } from 'react'
import { Masthead } from './shell/Masthead'
import { navigate, useRoute } from './router'
import { Materiales } from './materiales/Materiales'
import { Expediente } from './expediente/Expediente'
import { Estadisticas } from './estadisticas/Estadisticas'
import { Cesta } from './cesta/Cesta'
import { Cambios } from './cambios/Cambios'
import { Gym } from './gym/Gym'
import { Automatizaciones } from './automatizaciones/Automatizaciones'
import { Ajustes } from './ajustes/Ajustes'
import { ConfigGate } from './config/ConfigGate'
import { loadSession, saveSession, clearSession, type Session } from './session'

const focusBuscador = () => (document.getElementById('buscador') as HTMLInputElement | null)?.focus()

export function App() {
  const { section, param } = useRoute()
  const [session, setSession] = useState<Session | undefined>(() => loadSession())

  // ⌘K/Ctrl+K enfoca la busqueda de materiales (spec §3). Si la vista de
  // materiales no esta montada (otra seccion, o expediente con param), navega
  // primero y da un tick (setTimeout 0) para que React monte el input antes
  // de enfocarlo — el commit de React tras el hashchange no es sincrono con
  // este handler, asi que un rAF/microtask no basta de forma fiable.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'k') return
      e.preventDefault()
      if (section === 'materiales' && !param) { focusBuscador(); return }
      navigate('#/materiales')
      setTimeout(focusBuscador, 0)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [section, param])

  // gate de acceso: sin sesión, se pide crear cuenta o entrar con una clave.
  if (session === undefined)
    return <ConfigGate onConnect={next => { saveSession(next); setSession(next) }} />

  const exit = () => { clearSession(); setSession(undefined) }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Masthead session={session} onExit={exit} />
      {section === 'materiales' && !param && <Materiales />}
      {section === 'materiales' && param && <Expediente pn={param} />}
      {section === 'estadisticas' && <Estadisticas />}
      {section === 'cesta' && <Cesta />}
      {section === 'cambios' && <Cambios />}
      {section === 'gym' && <Gym />}
      {section === 'automatizaciones' && <Automatizaciones />}
      {section === 'ajustes' && <Ajustes onRotate={key => setSession({ ...session, key })} />}
    </div>
  )
}
