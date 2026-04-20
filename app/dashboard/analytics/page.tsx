import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { CrowdPatternChart } from '@/components/venue/CrowdPatternChart'
import { StatsRow } from '@/components/dashboard/StatsRow'
import { HourlySparkline } from '@/components/dashboard/HourlySparkline'

export default async function DashboardAnalyticsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'business') redirect('/explore')

  const { data: venue } = await supabase.from('venues')
    .select('id, name, max_capacity, current_count, is_active')
    .eq('owner_id', user.id).order('created_at').limit(1).maybeSingle()
  if (!venue) redirect('/onboarding/step-1')

  const today = new Date().toISOString().slice(0, 10)
  const [{ data: events }, { data: patterns }] = await Promise.all([
    supabase.from('capacity_events').select('id, delta, count_after, created_at').eq('venue_id', venue.id).gte('created_at', `${today}T00:00:00Z`).order('created_at').limit(200),
    supabase.from('crowd_patterns').select('hour, day_type, avg_pct').eq('venue_id', venue.id),
  ])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <DashboardSidebar venueName={venue.name} isActive={venue.is_active} ownerName={profile.full_name || ''} />
      <main className="dashboard-main" style={{ marginLeft: 240, padding: '40px 48px', minHeight: '100vh' }}>
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>ANALYTICS</p>
        <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 32, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 36px' }}>Crowd insights.</h1>
        <StatsRow events={events ?? []} maxCapacity={venue.max_capacity ?? 40} />
        <div style={{ marginBottom: 28 }}><HourlySparkline events={events ?? []} /></div>
        <CrowdPatternChart patterns={patterns ?? []} />
      </main>
    </div>
  )
}
