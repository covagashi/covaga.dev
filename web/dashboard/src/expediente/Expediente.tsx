import { useEffect, useMemo, useState } from 'react'
import { fetchAllParts, createChange, type Part } from '../api'
import { buildGroups, type Field } from './groups'
import { navigate } from '../router'
import { useT, type TKey } from '../i18n'
import s from './Expediente.module.css'

export function Expediente({ pn }: { pn: string }) {
  const t = useT()
  const [part, setPart] = useState<Part | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [reloadTick, setReloadTick] = useState(0)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let alive = true
    setPart(null); setNotFound(false); setLoadError(false)
    fetchAllParts({ q: pn })
      .then(list => {
        if (!alive) return
        const exact = list.find(p => p.part_number === pn) ?? null
        setPart(exact)
        setNotFound(!exact)
      })
      .catch(() => { if (alive) setLoadError(true) })
    return () => { alive = false }
  }, [pn, reloadTick])

  const groups = useMemo(() => part ? buildGroups(part) : [], [part])

  if (loadError) return (
    <div style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ color: 'var(--warn)' }}>{t('common.error')}</span>
      <button style={{ color: 'var(--ac)' }}
              onClick={() => setReloadTick(x => x + 1)}>{t('common.retry')}</button>
    </div>
  )
  if (notFound) return (
    <div style={{ padding: 22 }}>
      <p style={{ color: 'var(--warn)' }}>{t('exp.notfound', { pn })}</p>
      <button style={{ color: 'var(--ac)', marginTop: 8 }}
              onClick={() => navigate('#/materiales')}>{t('exp.back')}</button>
    </div>
  )
  if (!part) return <p style={{ padding: 22, color: 'var(--dim)' }}>{t('exp.loading', { pn })}</p>

  const propose = async (fl: Field) => {
    const label = t(fl.label, fl.labelVars)
    const val = window.prompt(t('exp.editPrompt', { label }), fl.value)
    if (val === null) return
    try {
      await createChange(`${label} · ${part.part_number}`, 'humano', [{
        part_number: part.part_number, variant: part.variant,
        field: fl.field!, lang: fl.lang, old: fl.value, new: val,
      }])
      setMsg(t('busy.created'))
    } catch (e: any) { setMsg(t('busy.error', { msg: e.message })) }
  }

  const filled = groups.flatMap(g => g.fields).filter(x => x.state === 'ok').length
  const total = groups.flatMap(g => g.fields).length
  const ordered = [...groups.filter(g => !g.empty), ...groups.filter(g => g.empty)]
  const cols: typeof ordered[] = [[], [], []]
  ordered.forEach((g, i) => cols[i % 3].push(g))

  const dpEstado = part.dp === 'found' ? t('dp.match') : part.dp === 'missing' ? t('dp.nomatch') : t('dp.unchecked')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className={s.head}>
        <div className={s.ph}>
          <img src={`/api/dataportal/thumb/${encodeURIComponent(part.part_number)}`}
               alt="" onError={e => (e.currentTarget.style.display = 'none')} />
        </div>
        <div className={s.id}>
          <h1>{part.description || part.part_number}</h1>
          <div className={s.sub}>{part.part_number} · {part.manufacturer}
            {part.product_group ? ` · ${part.product_group}` : ''}</div>
          <div style={{ display: 'flex', gap: 7 }}>
            <button className={`${s.btn} ${s.g}`} onClick={() => navigate('#/materiales')}>{t('exp.back')}</button>
          </div>
        </div>
        <div className={s.meta}>
          <div>{t('exp.filled', { n: filled, m: total })}</div>
          <div>{t('exp.dp', { estado: dpEstado })}</div>
        </div>
      </div>
      <div className={s.grid}>
        {cols.map((colGroups, i) => (
          <div key={i} className={s.col}>
            {colGroups.map(g => (
              <section key={g.title} className={s.sec}>
                <div className={s.tt}>{t(g.title)}<small>{g.apiHint}</small></div>
                {(g.empty ? g.fields.slice(0, 1) : g.fields).map((fl, fi) => {
                  const label = t(fl.label, fl.labelVars)
                  const value = fl.translateValue ? t(fl.value as TKey) : fl.value
                  return (
                    <div key={`${fl.apiName}-${fl.lang ?? fi}`} className={s.f}>
                      <span className={s.k}>{label}</span>
                      <span className={s.v}>
                        {fl.state === 'missing' ? <span className={s.miss}>∅</span>
                          : fl.state === 'na' ? <span className={s.na}>—</span> : value}
                        {fl.apiName === 'ARTICLE_ERPNR'
                          ? <span className={s.lk}>{t('exp.readonly')}</span>
                          : fl.editable && (
                            <button className={s.ed} aria-label={t('exp.proposeAria', { label })}
                                    onClick={() => propose(fl)}>✎</button>
                          )}
                      </span>
                    </div>
                  )
                })}
                {g.empty && <div className={s.f}><span className={`${s.k} ${s.na}`}>{t('exp.emptyGroup')}</span></div>}
              </section>
            ))}
          </div>
        ))}
      </div>
      <div className={s.sbar}>
        {msg || t('exp.hint')}
      </div>
    </div>
  )
}
