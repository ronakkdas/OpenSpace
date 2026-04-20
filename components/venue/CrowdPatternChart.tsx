'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatHour } from '@/lib/utils'

interface CrowdPattern {
  hour: number
  day_type: string
  avg_pct: number
}

interface CrowdPatternChartProps {
  patterns: CrowdPattern[]
}

export function CrowdPatternChart({ patterns }: CrowdPatternChartProps) {
  const currentHour = new Date().getHours()
  const isWeekend = [0, 6].includes(new Date().getDay())
  const dayType = isWeekend ? 'weekend' : 'weekday'
  const typicalByHour: Record<number, number> = {}
  patterns.filter(p => p.day_type === dayType).forEach(p => { typicalByHour[p.hour] = Math.round(p.avg_pct) })
  const chartData = Array.from({ length: 24 }, (_, h) => ({
    hour: h, label: formatHour(h),
    typical: typicalByHour[h] ?? null,
    today: h === currentHour ? (typicalByHour[h] ?? null) : null,
  }))
  const currentPct = typicalByHour[currentHour]

  if (patterns.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>No crowd pattern data yet.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
      <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>CROWD PATTERNS</p>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="typicalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(240,234,214,0.25)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="rgba(240,234,214,0.05)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fill: 'rgba(240,234,214,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} interval={5} />
          <YAxis tick={{ fill: 'rgba(240,234,214,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} tickCount={3} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: 'var(--text-1)' }} itemStyle={{ color: 'var(--text-2)' }} formatter={(v: unknown) => [`${String(v ?? '')}%`]} />
          <Area type="monotone" dataKey="typical" stroke="rgba(240,234,214,0.3)" strokeWidth={1.5} fill="url(#typicalGrad)" dot={false} connectNulls name="Typical" />
          <Area type="monotone" dataKey="today" stroke="#C8923A" strokeWidth={0} fill="none" dot={{ fill: '#C8923A', strokeWidth: 2, r: 5 }} connectNulls={false} name="Now" />
        </AreaChart>
      </ResponsiveContainer>
      {currentPct !== undefined && (
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 12, textAlign: 'right' }}>
          Current hour ({formatHour(currentHour)}) — typically <strong style={{ color: 'var(--text-1)' }}>{currentPct}% busy</strong>
        </p>
      )}
    </div>
  )
}
