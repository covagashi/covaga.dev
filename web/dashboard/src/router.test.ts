import { parseHash } from './router'

describe('parseHash', () => {
  it('por defecto materiales', () => {
    expect(parseHash('')).toEqual({ section: 'materiales', param: null, query: {} })
    expect(parseHash('#/')).toEqual({ section: 'materiales', param: null, query: {} })
  })
  it('seccion y parametro', () => {
    expect(parseHash('#/cambios')).toEqual({ section: 'cambios', param: null, query: {} })
    expect(parseHash('#/materiales/PXC.3209510')).toEqual(
      { section: 'materiales', param: 'PXC.3209510', query: {} })
  })
  it('seccion desconocida cae a materiales', () => {
    expect(parseHash('#/nada')).toEqual({ section: 'materiales', param: null, query: {} })
  })
  it('hash malformado no lanza: conserva el parametro crudo', () => {
    expect(parseHash('#/materiales/%')).toEqual({ section: 'materiales', param: '%', query: {} })
  })
  it('query en el hash', () => {
    expect(parseHash('#/materiales?missing=ul&mfr=wago')).toEqual(
      { section: 'materiales', param: null, query: { missing: 'ul', mfr: 'wago' } })
    expect(parseHash('#/cambios')).toEqual({ section: 'cambios', param: null, query: {} })
  })
})
