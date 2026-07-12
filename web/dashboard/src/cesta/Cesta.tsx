import { useEffect, useState } from 'react'
import { getBasket, removeBasketItem } from '../api'
import { useT } from '../i18n'
import s from './Cesta.module.css'

export function Cesta() {
  const t = useT()
  const [items, setItems] = useState<any[] | null>(null)
  const [err, setErr] = useState<'pat' | 'net' | null>(null)
  const load = () => getBasket()
    .then((b: any) => setItems(b.items ?? b ?? []))
    .catch((e: Error) => setErr(/pat/i.test(e.message) ? 'pat' : 'net'))
  useEffect(() => { load() }, [])

  if (err === 'pat') return <p style={{ padding: 22, color: 'var(--mut)', maxWidth: 520 }}>{t('cesta.nopat')}</p>
  if (err === 'net') return <p style={{ padding: 22, color: 'var(--warn)' }}>{t('common.error')}</p>
  if (items === null) return <p style={{ padding: 22, color: 'var(--dim)' }}>…</p>

  return (
    <div className={s.wrap}>
      <div className={s.lst}>
        <div className={s.head}><h2>{t('cesta.title')}</h2><span>{items.length} · {t('cesta.sub')}</span></div>
        {items.length === 0 && <p className={s.empty}>{t('cesta.empty')}</p>}
        {items.map(it => (
          <div key={it.id} className={s.r}>
            <div className={s.tx}><b>{it.description || it.part_number || it.id}</b>
              <span className="mono">{it.part_number ?? ''}</span></div>
            <button className={s.rm} onClick={async () => { await removeBasketItem(String(it.id)).catch(() => {}); load() }}>
              {t('cesta.remove')}</button>
          </div>
        ))}
      </div>
      <aside className={s.aside}>
        <div className={s.cap}>{t('cesta.how')}</div>
        {(['cesta.s1', 'cesta.s2', 'cesta.s3'] as const).map((k, i) => (
          <div key={k} className={s.step}><span className={s.n}>{i + 1}</span><p>{t(k)}</p></div>
        ))}
      </aside>
    </div>
  )
}
