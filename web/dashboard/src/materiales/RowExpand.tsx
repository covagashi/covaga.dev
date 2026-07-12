import type { Part } from '../api'
import { navigate } from '../router'
import { useT, type TKey } from '../i18n'
import s from './Materiales.module.css'

const KV = ({ k, v, missing }: { k: string; v: string; missing?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8,
                borderBottom: '1px solid var(--hl)', padding: '3px 0',
                fontSize: 11.5, color: 'var(--mut)' }}>
    <span>{k}</span>
    <span className="mono" style={{ fontSize: 10.5,
      color: missing ? 'var(--warn)' : 'var(--tx)' }}>{missing ? '∅' : (v || '—')}</span>
  </div>
)

export function RowExpand({ part, onPropose }: { part: Part; onPropose: (p: Part) => void }) {
  const t = useT()
  const dpKey: TKey = part.dp === 'found' ? 'dp.match' : part.dp === 'missing' ? 'dp.nomatch' : 'dp.unchecked'
  return (
    <div className={s.expand}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '3px 26px', flex: 1 }}>
        <KV k={t('x.currents')} v={`${part.current_iec || '—'} / ${part.current_ul || '—'}`} />
        <KV k={t('x.cevde')} v={`${part.ce_value || '—'} / ${part.vde_value || '—'}`} />
        <KV k={t('x.ul')} v={part.ul_value || ''} missing={!part.has_ul} />
        <KV k={t('x.erp')} v={part.erp_number || ''} />
        <KV k={t('x.dims')} v={[part.height, part.width, part.depth].filter(Boolean).join(' × ')} />
        <KV k={t('x.dp')} v={t(dpKey)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className={s.btn}
          onClick={() => navigate(`#/materiales/${encodeURIComponent(part.part_number)}`)}>
          {t('x.expediente')}
        </button>
        <button className={`${s.btn} ${s.g}`} onClick={() => onPropose(part)}>{t('x.propose')}</button>
      </div>
    </div>
  )
}
