import { useState, useCallback } from 'react'

export function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const toggle = useCallback((key: string) => setSelected(prev => {
    const next = new Set(prev)
    next.has(key) ? next.delete(key) : next.add(key)
    return next
  }), [])
  const clear = useCallback(() => setSelected(new Set()), [])
  return { selected, toggle, clear }
}
