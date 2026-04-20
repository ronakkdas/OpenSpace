'use client'

interface CapacityRingProps {
  current: number
  max: number
  size?: number
  strokeWidth?: number
}

export function CapacityRing({ current, max, size = 140, strokeWidth = 10 }: CapacityRingProps) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0
  const color = pct >= 90 ? '#C0392B' : pct >= 70 ? '#E8A838' : '#4A7C59'
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span style={{ fontFamily: '"DM Serif Display",serif', fontSize: size * 0.22, color: '#F0EAD6', lineHeight: 1 }}>
          {Math.round(pct)}%
        </span>
        <span style={{ fontSize: 10, color: 'rgba(240,234,214,0.45)' }}>full</span>
      </div>
    </div>
  )
}
