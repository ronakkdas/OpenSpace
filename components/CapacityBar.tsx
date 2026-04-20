'use client'

interface CapacityBarProps {
  current: number
  max: number
  height?: number
}

export function CapacityBar({ current, max, height = 6 }: CapacityBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0
  const color = pct >= 90 ? '#C0392B' : pct >= 70 ? '#E8A838' : '#4A7C59'
  return (
    <div style={{ width: '100%', height, background: 'rgba(255,255,255,0.08)', borderRadius: height, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: height, transition: 'width 0.4s ease, background 0.3s ease' }} />
    </div>
  )
}
