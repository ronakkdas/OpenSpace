'use client'
import { useState, useTransition } from 'react'
import { updateCount } from '@/actions/counter'

interface CounterControlProps {
  venueId: string
  initialCount: number
  maxCapacity: number
  onCountChange?: (n: number) => void
}

export function CounterControl({ venueId, initialCount, maxCapacity, onCountChange }: CounterControlProps) {
  const [count, setCount] = useState(initialCount)
  const [, startTransition] = useTransition()

  const handle = (delta: 1 | -1) => {
    if (delta === -1 && count <= 0) return
    if (delta === 1 && count >= maxCapacity) return
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30)
    const optimistic = Math.max(0, Math.min(maxCapacity, count + delta))
    const prev = count
    setCount(optimistic)
    onCountChange?.(optimistic)
    startTransition(async () => {
      const result = await updateCount(venueId, delta)
      if ('error' in result && result.error) { setCount(prev); onCountChange?.(prev) }
      else if (result.count !== optimistic) { setCount(result.count); onCountChange?.(result.count) }
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center' }}>
      <button onClick={() => handle(-1)} disabled={count <= 0}
        style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(192,57,43,0.15)', color: '#C0392B', border: '1px solid rgba(192,57,43,0.3)', fontSize: 36, cursor: count <= 0 ? 'not-allowed' : 'pointer', opacity: count <= 0 ? 0.4 : 1, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Remove person">−</button>
      <span style={{ fontFamily: '"DM Serif Display",serif', fontSize: 72, color: 'var(--text-1)', minWidth: 120, textAlign: 'center', lineHeight: 1 }}>{count}</span>
      <button onClick={() => handle(1)} disabled={count >= maxCapacity}
        style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(74,124,89,0.15)', color: '#4A7C59', border: '1px solid rgba(74,124,89,0.3)', fontSize: 42, cursor: count >= maxCapacity ? 'not-allowed' : 'pointer', opacity: count >= maxCapacity ? 0.4 : 1, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Add person">+</button>
    </div>
  )
}
