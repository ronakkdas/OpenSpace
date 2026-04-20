import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { formatDistanceToNow } from 'date-fns'

function Stars({ rating }: { rating: number }) {
  return <span>{Array.from({length:5},(_,i)=><span key={i} style={{color:i<rating?'#C8923A':'rgba(240,234,214,0.2)',fontSize:14}}>★</span>)}</span>
}

export default async function DashboardReviewsPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'business') redirect('/explore')

  const { data: venue } = await supabase.from('venues').select('id, name, is_active').eq('owner_id', user.id).order('created_at').limit(1).maybeSingle()
  if (!venue) redirect('/onboarding/step-1')

  const { data: reviews } = await supabase.from('reviews').select('id, author_name, rating, body, created_at').eq('venue_id', venue.id).order('created_at', { ascending: false })
  const avg = reviews && reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <DashboardSidebar venueName={venue.name} isActive={venue.is_active} ownerName={profile.full_name || ''} />
      <main className="dashboard-main" style={{ marginLeft: 240, padding: '40px 48px', minHeight: '100vh', maxWidth: 760 }}>
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>REVIEWS</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 36 }}>
          <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 32, color: 'var(--text-1)', fontWeight: 400, margin: 0 }}>Customer reviews.</h1>
          {avg && <span style={{ fontSize: 20, color: 'var(--gold)', fontFamily: '"DM Serif Display",serif' }}>★ {avg}</span>}
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>({(reviews ?? []).length} total)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(reviews ?? []).map(r => (
            <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div><span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{r.author_name}</span><span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 10 }}>{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span></div>
                <Stars rating={r.rating} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>{r.body}</p>
            </div>
          ))}
          {(reviews ?? []).length === 0 && <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '48px 0' }}>No reviews yet. Share your venue link to get the first one!</p>}
        </div>
      </main>
    </div>
  )
}
