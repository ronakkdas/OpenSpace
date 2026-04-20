import { ActivityLog } from './ActivityLog'
import { HourlySparkline } from './HourlySparkline'
import Link from 'next/link'

interface CapacityEvent { id: string; delta: number; count_after: number; created_at: string }

interface DashboardRightRailProps {
  events: CapacityEvent[]
  venueId: string
  isActive: boolean
}

export function DashboardRightRail({ events, venueId }: DashboardRightRailProps) {
  return (
    <aside className="dashboard-right-rail" style={{ width:300, position:'fixed', top:0, right:0, bottom:0, background:'var(--bg)', borderLeft:'1px solid var(--border)', padding:'24px 20px', overflowY:'auto', zIndex:30 }}>
      <div style={{ paddingTop: 20 }}><ActivityLog events={events} /></div>
      <div style={{ marginTop:32, paddingTop:24, borderTop:'1px solid var(--border)' }}><HourlySparkline events={events} /></div>
      <div style={{ marginTop:32, paddingTop:24, borderTop:'1px solid var(--border)' }}>
        <p style={{ fontSize:11, letterSpacing:'3px', textTransform:'uppercase', color:'var(--text-3)', marginBottom:14 }}>QUICK ACTIONS</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <Link href={`/venue/${venueId}`} target="_blank" style={{ display:'block', padding:'10px 14px', textAlign:'center', background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-1)', fontSize:12, textDecoration:'none' }}>
            Preview Public Listing ↗
          </Link>
        </div>
      </div>
    </aside>
  )
}
