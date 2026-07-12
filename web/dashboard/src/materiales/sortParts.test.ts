import { sortParts } from './sortParts'

type Item = { v: string }
const item = (v: string): Item => ({ v })
const val = (i: Item) => i.v

it('ordena numericamente cuando ambos valores parsean a numero', () => {
  const items = [item('10'), item('2'), item('30')]
  expect(sortParts(items, val, 'asc').map(val)).toEqual(['2', '10', '30'])
})

it('ordena por el prefijo numerico via parseFloat aunque haya unidades (p.ej. "10 A")', () => {
  const items = [item('10 A'), item('2 A'), item('30 A')]
  expect(sortParts(items, val, 'asc').map(val)).toEqual(['2 A', '10 A', '30 A'])
})

it('desc invierte el orden numerico', () => {
  const items = [item('10'), item('2'), item('30')]
  expect(sortParts(items, val, 'desc').map(val)).toEqual(['30', '10', '2'])
})

it('cuando no ambos son numericos usa localeCompare("es")', () => {
  const items = [item('Zebra'), item('ábaco'), item('Árbol')]
  expect(sortParts(items, val, 'asc').map(val)).toEqual(['ábaco', 'Árbol', 'Zebra'])
})

it('valores vacios no parsean a numero y caen a orden alfabetico', () => {
  const items = [item(''), item('b'), item('a')]
  expect(sortParts(items, val, 'asc').map(val)).toEqual(['', 'a', 'b'])
})

it('mezcla numerico/no-numerico: el par numerico se compara numericamente, el resto por localeCompare', () => {
  const items = [item('10'), item('abc'), item('2')]
  // '10' y '2' son ambos numericos -> se comparan numericamente (2 < 10);
  // frente a 'abc' (no numerico) cada uno cae a localeCompare('es').
  expect(sortParts(items, val, 'asc').map(val)).toEqual(['2', '10', 'abc'])
})

it('no muta el array recibido', () => {
  const items = [item('b'), item('a')]
  const before = [...items]
  sortParts(items, val, 'asc')
  expect(items).toEqual(before)
})
