'use client'
import { useState, useCallback } from 'react'
import { CapacityRing } from '@/components/CapacityRing'
import { CapacityBar } from '@/components/CapacityBar'
import { useRealtimeVenue } from '@/hooks/useRealtimeVenue'
import { capacityStatus } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface LiveCapacityCardProps {
  venueId: string
  initialCount: number
  maxCapacity: number
}

export function LiveCapacityCard({ venueId, initialCount, maxCapacity }: LiveCapacityCardProps) {
  const [count, setCount] = useState(initialCount)
  const [updatedAt, setUpdatedAt] = useState(new Date())

  const onUpdate = useCallback((data: Record<string, unknown>) => {
    if (typeof data.current_count === 'number') {
      setCount(data.current_count)
      setUpdatedAt(new Date())
    }
  }, [])
  useRealtimeVenue(venueId, onUpdate)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px' }}>
      <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 20 }}>LIVE OCCUPANCY</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <CapacityRing current={count} max={maxCapacity} size={140} />
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 28, color: 'var(--text-1)', margin: '0 0 6px' }}>
            {count} <span style={{ fontSize: 16, color: 'var(--text-2)' }}>of {maxCapacity} seats</span>
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>{capacityStatus(count, maxCapacity)}</p>
          <CapacityBar current={count} max={maxCapacity} height={8} />
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}</p>
        </div>
      </div>
    </div>
  )
}
