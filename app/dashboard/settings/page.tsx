import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { VenueSettings } from '@/components/dashboard/VenueSettings'

export default async function DashboardSettingsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'business') redirect('/explore')

  const { data: venue } = await supabase.from('venues')
    .select('id, name, type, description, address, image_url, website_url, max_capacity, current_count, hours_open, hours_close, popular_items, is_active, venue_amenities(label)')
    .eq('owner_id', user.id).order('created_at').limit(1).maybeSingle()
  if (!venue) redirect('/onboarding/step-1')

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <DashboardSidebar venueName={venue.name} isActive={venue.is_active} ownerName={profile.full_name || ''} />
      <main className="dashboard-main" style={{ marginLeft: 240, marginRight: 0, padding: '40px 48px', minHeight: '100vh', maxWidth: 780 }}>
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>VENUE SETTINGS</p>
        <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 32, color: 'var(--text-1)', fontWeight: 400, margin: '0 0 36px' }}>Manage your venue.</h1>
        <VenueSettings venue={venue as Parameters<typeof VenueSettings>[0]['venue']} />
      </main>
    </div>
  )
}
