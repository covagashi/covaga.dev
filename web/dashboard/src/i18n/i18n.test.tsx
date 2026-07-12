import { render, screen, fireEvent } from '@testing-library/react'
import { I18nProvider, useT, useLang } from './index'
import * as dicts from './dicts'

function Probe() {
  const t = useT()
  const [lang, setLang] = useLang()
  return (
    <div>
      <span>{t('rail.title')}</span>
      <span>{t('sel.count', { n: 3 })}</span>
      <button onClick={() => setLang('en')}>cambiar</button>
      <span data-testid="lang">{lang}</span>
    </div>
  )
}

// jsdom reporta navigator.language = 'en-US'; forzamos 'es' explícito para que el
// arranque del test sea determinista (ver Global Constraints: ES es el default en tests).
beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('byndr.lang', 'es')
})

it('traduce, interpola y cambia de idioma con persistencia', () => {
  render(<I18nProvider><Probe /></I18nProvider>)
  expect(screen.getByText('colas de trabajo')).toBeInTheDocument()
  expect(screen.getByText('3 seleccionados')).toBeInTheDocument()
  fireEvent.click(screen.getByText('cambiar'))
  expect(screen.getByText('work queues')).toBeInTheDocument()
  expect(localStorage.getItem('byndr.lang')).toBe('en')
})

it('los 7 idiomas tienen todas las claves con placeholders intactos', () => {
  // nota (C3): el brief usa require('./dicts'), pero el proyecto es ESM puro
  // ("type": "module" + vite-node) y require no resuelve módulos relativos aquí
  // (Cannot find module './dicts'). Se usa import * as dicts en su lugar.
  const d = dicts as Record<string, Record<string, string>>
  const keys = Object.keys(d.es)
  for (const lang of ['en', 'de', 'pt', 'ja', 'ko', 'zh']) {
    expect(Object.keys(d[lang]).sort()).toEqual(keys.slice().sort())
    for (const k of keys) {
      const ph = (d.es[k].match(/\{\w+\}/g) || []).sort()
      expect((d[lang][k].match(/\{\w+\}/g) || []).sort()).toEqual(ph)
    }
  }
})
