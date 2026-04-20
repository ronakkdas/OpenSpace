interface CapacityEvent {
  id: string
  delta: number
  count_after: number
  created_at: string
}

interface StatsRowProps {
  events: CapacityEvent[]
  maxCapacity: number
}

export function StatsRow({ events, maxCapacity }: StatsRowProps) {
  const arrivals = events.filter(e => e.delta === 1).length
  const departures = events.filter(e => e.delta === -1).length
  const peakCount = events.reduce((max, e) => Math.max(max, e.count_after), 0)
  const avgOccupancy = events.length > 0 ? Math.round(events.reduce((sum, e) => sum + e.count_after, 0) / events.length) : 0
  const avgPct = maxCapacity > 0 ? Math.round((avgOccupancy / maxCapacity) * 100) : 0
  const stats = [
    { label: 'Checked In Today', value: arrivals },
    { label: 'Left Today', value: departures },
    { label: 'Peak Count', value: peakCount },
    { label: 'Avg Occupancy', value: `${avgPct}%` },
  ]
  return (
    <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 16px' }}>
          <p style={{ fontFamily: '"DM Serif Display",serif', fontSize: 32, color: 'var(--text-1)', margin: '0 0 6px', lineHeight: 1 }}>{s.value}</p>
          <p style={{ fontSize: 12, letterSpacing: '0.5px', color: 'var(--text-3)', margin: 0, textTransform: 'uppercase' }}>{s.label}</p>
        </div>
      ))}
    </div>
  )
}
