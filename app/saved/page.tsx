import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VenueCard, type VenueCardVenue } from '@/components/explore/VenueCard'
import Link from 'next/link'

export default async function SavedPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/saved')

  const { data: profile } = await supabase.from('profiles').select('is_pro').eq('id', user.id).maybeSingle()
  const isPro = profile?.is_pro ?? false

  const { data: favs } = await supabase.from('favorites').select(`
    id, venue_id,
    venues(id, name, description, type, address, image_url, max_capacity, current_count, hours_open, hours_close, popular_items, is_active, lat, lng, venue_amenities(label))
  `).eq('user_id', user.id).order('created_at', { ascending: false })

  const venues: VenueCardVenue[] = (favs ?? [])
    .map(f => f.venues as unknown as VenueCardVenue)
    .filter(Boolean)

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 65 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        <p style={{ fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>YOUR COLLECTION</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 36 }}>
          <h1 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--text-1)', margin: 0, fontWeight: 400 }}>Saved spots.</h1>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {isPro ? `${venues.length} saved` : `${venues.length} of 5 saved`}
          </span>
        </div>

        {venues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>♡</p>
            <h2 style={{ fontFamily: '"DM Serif Display",serif', fontSize: 24, color: 'var(--text-1)', marginBottom: 10, fontWeight: 400 }}>No saved spots yet</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28 }}>Heart a venue on the explore page to save it here.</p>
            <Link href="/explore" style={{ padding: '12px 28px', background: 'var(--gold)', borderRadius: 24, color: '#2c1a0e', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Explore Spots →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {venues.map(v => (
              <VenueCard key={v.id} venue={v} isPro={isPro} isFavorited />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
