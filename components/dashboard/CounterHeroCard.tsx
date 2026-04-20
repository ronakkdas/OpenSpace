'use client'
import { useState, useCallback } from 'react'
import { CapacityRing } from '@/components/CapacityRing'
import { CapacityBar } from '@/components/CapacityBar'
import { CounterControl } from './CounterControl'
import { useRealtimeVenue } from '@/hooks/useRealtimeVenue'
import { capacityStatus } from '@/lib/utils'

interface CounterHeroCardProps {
  venueId: string
  initialCount: number
  maxCapacity: number
}

export function CounterHeroCard({ venueId, initialCount, maxCapacity }: CounterHeroCardProps) {
  const [count, setCount] = useState(initialCount)
  const onUpdate = useCallback((data: Record<string, unknown>) => {
    if (typeof data.current_count === 'number') setCount(data.current_count)
  }, [])
  useRealtimeVenue(venueId, onUpdate)

  return (
    <div className="counter-hero" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '36px', marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <CapacityRing current={count} max={maxCapacity} size={200} strokeWidth={14} />
      </div>
      <div>
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>CURRENT OCCUPANCY</p>
        <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 28, color: 'var(--text-1)', margin: '0 0 8px' }}>
          {count} <span style={{ fontSize: 16, color: 'var(--text-2)' }}>of {maxCapacity}</span>
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>{capacityStatus(count, maxCapacity)}</p>
        <CapacityBar current={count} max={maxCapacity} height={10} />
        <div style={{ marginTop: 28 }}>
          <CounterControl venueId={venueId} initialCount={count} maxCapacity={maxCapacity} onCountChange={setCount} />
        </div>
      </div>
    </div>
  )
}
