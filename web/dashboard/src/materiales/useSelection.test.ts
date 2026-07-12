import { renderHook, act } from '@testing-library/react'
import { useSelection } from './useSelection'

it('toggle añade y quita; clear vacía', () => {
  const { result } = renderHook(() => useSelection())
  act(() => result.current.toggle('A|'))
  act(() => result.current.toggle('B|'))
  expect([...result.current.selected]).toEqual(['A|', 'B|'])
  act(() => result.current.toggle('A|'))
  expect([...result.current.selected]).toEqual(['B|'])
  act(() => result.current.clear())
  expect(result.current.selected.size).toBe(0)
})
