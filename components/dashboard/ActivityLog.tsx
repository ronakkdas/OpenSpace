import { formatDistanceToNow } from 'date-fns'

interface CapacityEvent {
  id: string
  delta: number
  count_after: number
  created_at: string
}

export function ActivityLog({ events }: { events: CapacityEvent[] }) {
  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>RECENT ACTIVITY</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.slice(0, 8).map(e => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: e.delta === 1 ? '#4A7C59' : '#C0392B' }} />
            <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1 }}>{e.delta === 1 ? 'Customer arrived' : 'Customer left'} · {e.count_after} total</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</span>
          </div>
        ))}
        {events.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)', padding: '12px 0' }}>No activity today yet.</p>}
      </div>
    </div>
  )
}
