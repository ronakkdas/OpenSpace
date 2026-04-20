import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardRightRail } from '@/components/dashboard/DashboardRightRail'
import { CounterHeroCard } from '@/components/dashboard/CounterHeroCard'
import { StatsRow } from '@/components/dashboard/StatsRow'
import { CrowdPatternChart } from '@/components/venue/CrowdPatternChart'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'business') redirect('/explore')

  const { data: venue } = await supabase.from('venues')
    .select('id, name, description, address, hours_open, hours_close, max_capacity, current_count, popular_items, is_active')
    .eq('owner_id', user.id).order('created_at').limit(1).maybeSingle()
  if (!venue) redirect('/onboarding/step-1')

  const today = new Date().toISOString().slice(0, 10)
  const { data: events } = await supabase.from('capacity_events')
    .select('id, delta, count_after, created_at')
    .eq('venue_id', venue.id)
    .gte('created_at', `${today}T00:00:00Z`)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: patterns } = await supabase.from('crowd_patterns')
    .select('hour, day_type, avg_pct')
    .eq('venue_id', venue.id)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const ownerName = profile.full_name || user.email?.split('@')[0] || 'Owner'

  const eventsArr = events ?? []

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <DashboardSidebar venueName={venue.name} isActive={venue.is_active} ownerName={ownerName} />
      <main className="dashboard-main" style={{ marginLeft: 240, marginRight: 300, padding: '28px 32px', minHeight: '100vh' }}>
        {/* Greeting */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 26, color: 'var(--text-1)', fontWeight: 400, margin: 0 }}>{greeting}, {venue.name}</h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        <CounterHeroCard venueId={venue.id} initialCount={venue.current_count ?? 0} maxCapacity={venue.max_capacity ?? 40} />
        <StatsRow events={eventsArr} maxCapacity={venue.max_capacity ?? 40} />

        <div style={{ marginTop: 24 }}>
          <CrowdPatternChart patterns={patterns ?? []} />
        </div>
      </main>
      <DashboardRightRail events={eventsArr} venueId={venue.id} isActive={venue.is_active} />
    </div>
  )
}
