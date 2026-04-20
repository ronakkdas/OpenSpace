'use client'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { formatHour } from '@/lib/utils'

interface CapacityEvent {
  count_after: number
  created_at: string
}

export function HourlySparkline({ events }: { events: CapacityEvent[] }) {
  const byHour: Record<number, number> = {}
  events.forEach(e => { byHour[new Date(e.created_at).getHours()] = e.count_after })
  const data = Array.from({ length: 24 }, (_, h) => ({ hour: formatHour(h), count: byHour[h] ?? null }))
  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>TODAY'S PATTERN</p>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C8923A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#C8923A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11 }} labelStyle={{ color: 'var(--text-1)' }} itemStyle={{ color: 'var(--text-2)' }} />
          <Area type="monotone" dataKey="count" stroke="#C8923A" strokeWidth={1.5} fill="url(#sparkGrad)" dot={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
