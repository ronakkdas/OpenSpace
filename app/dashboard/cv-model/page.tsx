import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { NotifyMeButton } from './NotifyMeButton'

export default async function CvModelPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'business') redirect('/explore')

  const { data: venue } = await supabase.from('venues')
    .select('id, name, is_active')
    .eq('owner_id', user.id).order('created_at').limit(1).maybeSingle()
  if (!venue) redirect('/onboarding/step-1')

  const ownerName = profile.full_name || user.email?.split('@')[0] || 'Owner'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <DashboardSidebar venueName={venue.name} isActive={venue.is_active} ownerName={ownerName} />
      <main className="dashboard-main" style={{ marginLeft: 240, padding: '28px 32px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', padding: '60px 32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18 }}>
          {/* Subtle "in-development" mark — three concentric arcs evoke a CV
              field-of-view without resorting to an emoji. */}
          <svg width="56" height="56" viewBox="0 0 56 56" style={{ marginBottom: 22, opacity: 0.6 }}>
            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--gold)" strokeWidth="1" strokeDasharray="3 4" />
            <circle cx="28" cy="28" r="14" fill="none" stroke="var(--gold)" strokeWidth="1" />
            <circle cx="28" cy="28" r="4"  fill="var(--gold)" />
          </svg>
          <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', margin: '0 0 14px' }}>ON THE ROADMAP</p>
          <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 30, color: 'var(--text-1)', margin: '0 0 14px', fontWeight: 400, lineHeight: 1.2 }}>
            Computer Vision Model
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 28px' }}>
            Automated capacity counting from a single ceiling camera — no staff input needed.
            Coming soon, expansion upon funding / resources.
          </p>
          <NotifyMeButton venueId={venue.id} />
        </div>
      </main>
    </div>
  )
}
