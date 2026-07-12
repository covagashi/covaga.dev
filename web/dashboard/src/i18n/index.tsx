import { createContext, useContext, useState, type ReactNode } from 'react'
import { es, en, de, pt, ja, ko, zh, type Dict } from './dicts'

export type Lang = 'es' | 'en' | 'de' | 'pt' | 'ja' | 'ko' | 'zh'
export type TKey = keyof typeof es

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'es', label: 'Español' }, { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' }, { id: 'pt', label: 'Português' },
  { id: 'ja', label: '日本語' }, { id: 'ko', label: '한국어' }, { id: 'zh', label: '中文' },
]

const DICTS: Record<Lang, Dict> = { es, en, de, pt, ja, ko, zh }

const detect = (): Lang => {
  const saved = localStorage.getItem('byndr.lang') as Lang | null
  if (saved && LANGS.some(l => l.id === saved)) return saved
  const nav = navigator.language.slice(0, 2) as Lang
  return LANGS.some(l => l.id === nav) ? nav : 'es'
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'es', setLang: () => {} })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect)
  const setLang = (l: Lang) => { localStorage.setItem('byndr.lang', l); setLangState(l) }
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export function useLang(): [Lang, (l: Lang) => void] {
  const { lang, setLang } = useContext(Ctx)
  return [lang, setLang]
}

export function useT() {
  const { lang } = useContext(Ctx)
  return (k: TKey, vars?: Record<string, string | number>): string => {
    let s: string = DICTS[lang][k] ?? es[k]
    if (vars) for (const [name, v] of Object.entries(vars))
      s = s.replaceAll(`{${name}}`, String(v))
    return s
  }
}

export function LangSelect() {
  const [lang, setLang] = useLang()
  const t = useT()
  return (
    <select aria-label={t('lang.selector')} value={lang}
            onChange={e => setLang(e.target.value as Lang)}
            style={{ background: 'var(--sf2)', border: '1px solid var(--hl2)',
                     borderRadius: 7, padding: '3px 6px', fontSize: 11, color: 'var(--mut)' }}>
      {LANGS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
    </select>
  )
}
