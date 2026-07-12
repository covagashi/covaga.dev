import type { Part } from '../api'
import type { TKey } from '../i18n'

export type Field = { label: TKey; labelVars?: Record<string, string | number>;
  apiName: string; value: string; translateValue?: boolean;
  state: 'ok' | 'missing' | 'na'; editable: boolean; field?: string; lang?: string }
export type Group = { title: TKey; apiHint: string; fields: Field[]; empty: boolean }

const WRITABLE = new Set(['photo_path', 'macro_path', 'order_number',
  'ul_value', 'ce_value', 'note', 'description'])

function f(label: TKey, apiName: string, value: string | undefined,
           opts: { field?: string; lang?: string; missing?: boolean; labelVars?: Record<string, string | number>;
                    translateValue?: boolean } = {}): Field {
  const v = value ?? ''
  const editable = !!opts.field && WRITABLE.has(opts.field)
  const state = opts.missing ?? !v ? (editable ? 'missing' : 'na') : 'ok'
  return { label, labelVars: opts.labelVars, apiName, value: v, translateValue: opts.translateValue,
           state, editable, field: opts.field, lang: opts.lang }
}

export function buildGroups(p: Part): Group[] {
  const i18n = p.description_i18n || {}
  const groups: Omit<Group, 'empty'>[] = [
    { title: 'g.identificacion', apiHint: 'ARTICLE_DESCR* · ORDERNR', fields: [
      f('f.descr', 'ARTICLE_DESCR1', i18n.es_ES, { field: 'description', lang: 'es_ES', labelVars: { lang: 'es' } }),
      f('f.descr', 'ARTICLE_DESCR1', i18n.en_US, { field: 'description', lang: 'en_US', labelVars: { lang: 'en' } }),
      f('f.descr', 'ARTICLE_DESCR1', i18n.de_DE, { field: 'description', lang: 'de_DE', labelVars: { lang: 'de' } }),
      f('f.descr2', 'ARTICLE_DESCR2', p.descr2),
      f('f.caracteristicas', 'ARTICLE_CHARACTERISTICS', p.characteristics),
      f('f.pedido', 'ARTICLE_ORDERNR', p.order_number, { field: 'order_number' }),
      f('f.descatalogado', 'ARTICLE_DISCONTINUED', p.is_discontinued ? 'f.si' : 'f.no', { translateValue: true }),
    ]},
    { title: 'g.certificados', apiHint: 'CERTIFICATE_*', fields: [
      f('f.ulfile', 'ARTICLE_CERTIFICATE_UL', p.ul_value, { field: 'ul_value', missing: !p.has_ul }),
      f('f.ulccn', 'ARTICLE_CERTIFICATE_UL_CNN', p.ul_cnn),
      f('f.ce', 'ARTICLE_CERTIFICATE_CE', p.ce_value, { field: 'ce_value', missing: !p.has_ce }),
      f('f.vde', 'ARTICLE_CERTIFICATE_VDE', p.vde_value),
      f('f.atex', 'ARTICLE_CERTIFICATE_ATEX', p.atex_value),
      f('f.certgeneral', 'ARTICLE_CERTIFICATE', p.certificate),
    ]},
    { title: 'g.comercial', apiHint: 'ERPNR · SUPPLIER · PRICE', fields: [
      f('f.erp', 'ARTICLE_ERPNR', p.erp_number),  // sin field → nunca editable
      f('f.proveedor', 'ARTICLE_SUPPLIER_NAME', p.supplier),
      f('f.precio', 'ARTICLE_PURCHASEPRICE_1', p.purchase_price),
    ]},
    { title: 'g.conexion', apiHint: 'CROSSSECTION · AWG · CURRENT*', fields: [
      f('f.seccion', 'ARTICLE_CROSSSECTIONFROM/TILL',
        [p.cross_section_from, p.cross_section_till].filter(Boolean).join(' – ')),
      f('f.awg', 'ARTICLE_AWGFROM/TILL',
        [p.awg_from, p.awg_till].filter(Boolean).join(' – ')),
      f('f.iec', 'ARTICLE_CURRENTIEC', p.current_iec),
      f('f.ul', 'ARTICLE_CURRENTUL', p.current_ul),
      f('f.tecnica', 'ARTICLE_CONNECTIONMETHOD', p.connection_method),
      f('f.ip', 'ARTICLE_DEGOFPROTECTION', p.protection_degree),
    ]},
    { title: 'g.dimensiones', apiHint: 'HEIGHT · WIDTH · DEPTH · MASS', fields: [
      f('f.dims', 'ARTICLE_HEIGHT/WIDTH/DEPTH',
        [p.height, p.width, p.depth].filter(Boolean).join(' × ')),
      f('f.peso', 'ARTICLE_WEIGHT', p.weight),
      f('f.color', 'ARTICLE_COLOR', p.color),
      f('f.material', 'ARTICLE_MATERIAL', p.material),
      f('f.montaje', 'ARTICLE_MOUNTINGSITE', p.mounting_site),
    ]},
    { title: 'g.cad', apiHint: 'MACRO · EXTERNAL_DOCUMENT', fields: [
      f('f.macrog', 'ARTICLE_MACRO', p.graphic_macro, { field: 'macro_path' }),
      f('f.macroe', 'ARTICLE_GROUPSYMBOLMACRO', p.macro_path, { field: 'macro_path' }),
      f('f.foto', 'ARTICLE_PICTUREFILE', p.photo_path, { field: 'photo_path', missing: !p.has_photo }),
      f('f.doc1', 'ARTICLE_EXTERNAL_DOCUMENT', p.doc1_name),
    ]},
  ]
  return groups.map(g => ({ ...g, empty: g.fields.every(x => x.state !== 'ok') }))
}
