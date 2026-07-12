import type { Part } from '../api'
import type { TKey } from '../i18n'

export type Col = {
  key: string; label: TKey; apiName: string; width: number
  value: (p: Part) => string
  missing?: (p: Part) => boolean
  translateValue?: boolean
}

const str = (k: keyof Part) => (p: Part) => String(p[k] ?? '')
const col = (key: string, label: TKey, apiName: string, width: number,
             value: (p: Part) => string, missing?: (p: Part) => boolean,
             translateValue?: boolean): Col =>
  ({ key, label, apiName, width, value, missing, translateValue })

const PN = col('part_number', 'col.part_number', 'PART_PARTNR', 168, str('part_number'))
const DESCR = col('description', 'col.description', 'ARTICLE_DESCR1', 0, str('description'))

export const COLUMN_VIEWS = {
  general: [PN, DESCR,
    col('ul_value', 'col.ul', 'ARTICLE_CERTIFICATE_UL', 84, str('ul_value'), p => !p.has_ul),
    col('dp', 'col.dp', '—', 74,
        p => p.dp === 'found' ? 'dp.match' : p.dp === 'missing' ? 'dp.nomatch' : '',
        undefined, true),
    col('order_number', 'col.order', 'ARTICLE_ORDERNR', 100, str('order_number')),
  ],
  electrica: [PN, DESCR,
    col('current_iec', 'col.current_iec', 'ARTICLE_CURRENTIEC', 76, str('current_iec')),
    col('current_ul', 'col.current_ul', 'ARTICLE_CURRENTUL', 66, str('current_ul')),
    col('protection_degree', 'col.ip', 'ARTICLE_DEGOFPROTECTION', 56, str('protection_degree')),
    col('connection_method', 'col.connection', 'ARTICLE_CONNECTIONMETHOD', 90, str('connection_method')),
  ],
  dimensiones: [PN, DESCR,
    col('height', 'col.height', 'ARTICLE_HEIGHT', 64, str('height')),
    col('width', 'col.width', 'ARTICLE_WIDTH', 64, str('width')),
    col('depth', 'col.depth', 'ARTICLE_DEPTH', 64, str('depth')),
    col('weight', 'col.weight', 'ARTICLE_WEIGHT', 64, str('weight')),
    col('material', 'col.material', 'ARTICLE_MATERIAL', 90, str('material')),
  ],
  certificados: [PN, DESCR,
    col('ul_value', 'col.ul', 'ARTICLE_CERTIFICATE_UL', 84, str('ul_value'), p => !p.has_ul),
    col('ul_cnn', 'col.ul_cnn', 'ARTICLE_CERTIFICATE_UL_CNN', 76, str('ul_cnn')),
    col('ce_value', 'col.ce', 'ARTICLE_CERTIFICATE_CE', 66, str('ce_value'), p => !p.has_ce),
    col('vde_value', 'col.vde', 'ARTICLE_CERTIFICATE_VDE', 84, str('vde_value')),
    col('atex_value', 'col.atex', 'ARTICLE_CERTIFICATE_ATEX', 76, str('atex_value')),
  ],
  comercial: [PN, DESCR,
    col('erp_number', 'col.erp', 'ARTICLE_ERPNR', 84, str('erp_number')),
    col('supplier', 'col.supplier', 'ARTICLE_SUPPLIER_NAME', 110, str('supplier')),
    col('purchase_price', 'col.price', 'ARTICLE_PURCHASEPRICE_1', 76, str('purchase_price')),
    col('order_number', 'col.order', 'ARTICLE_ORDERNR', 100, str('order_number')),
  ],
  docs: [PN, DESCR,
    col('photo_path', 'col.photo', 'ARTICLE_PICTUREFILE', 110, str('photo_path'), p => !p.has_photo),
    col('macro_path', 'col.macro', 'ARTICLE_GROUPSYMBOLMACRO', 110, str('macro_path'), p => !p.has_macro),
    col('doc1_name', 'col.doc1', 'ARTICLE_EXTERNAL_DOCUMENT_DESIGNATION', 110, str('doc1_name')),
  ],
} satisfies Record<string, Col[]>

export const VIEW_LABELS: [keyof typeof COLUMN_VIEWS, TKey][] = [
  ['general', 'view.general'], ['electrica', 'view.electrica'], ['dimensiones', 'view.dimensiones'],
  ['certificados', 'view.certificados'], ['comercial', 'view.comercial'], ['docs', 'view.docs'],
]
