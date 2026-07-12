import { describe, it, expect } from 'vitest'
import { confidencePct, confidenceLevel, toggle, shown, shortTime } from './lib'

describe('confidencePct', () => {
  it('redondea a porcentaje entero', () => {
    expect(confidencePct(0.8)).toBe('80%')
    expect(confidencePct(0.923)).toBe('92%')
    expect(confidencePct(1)).toBe('100%')
    expect(confidencePct(0)).toBe('0%')
  })
})

describe('confidenceLevel', () => {
  it('clasifica alta/media/baja por umbrales', () => {
    expect(confidenceLevel(0.9)).toBe('alta')
    expect(confidenceLevel(0.8)).toBe('alta')
    expect(confidenceLevel(0.65)).toBe('media')
    expect(confidenceLevel(0.5)).toBe('media')
    expect(confidenceLevel(0.3)).toBe('baja')
  })
})

describe('toggle', () => {
  it('añade cuando falta y quita cuando está, de forma inmutable', () => {
    const a = new Set<string>(['x'])
    const b = toggle(a, 'y')
    expect([...b].sort()).toEqual(['x', 'y'])
    expect([...a]).toEqual(['x']) // original intacto
    const c = toggle(b, 'x')
    expect([...c]).toEqual(['y'])
  })
})

describe('shown', () => {
  it('marca los valores vacíos', () => {
    expect(shown('')).toBe('∅')
    expect(shown('hola')).toBe('hola')
  })
})

describe('shortTime', () => {
  it('devuelve el original si no parsea', () => {
    expect(shortTime('no-es-fecha')).toBe('no-es-fecha')
  })
  it('formatea una fecha iso válida sin lanzar', () => {
    expect(typeof shortTime('2026-07-12T10:00:00Z')).toBe('string')
  })
})
